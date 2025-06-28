terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.10"
    }
  }

  backend "s3" {
    bucket = "my-cafesao-terraform-state"
    key    = "tools-uri/terraform.tfstate"
    region = "us-east-1"
    profile = "personal"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-east-1"
  profile = "personal"
}

resource "aws_s3_bucket" "bucket-tools-uri" {
  bucket = "tools-uri.cafesao.net"
}

resource "aws_s3_bucket_public_access_block" "bucket-tools-uri-public-access-block" {
  bucket = aws_s3_bucket.bucket-tools-uri.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "bucket-tools-uri-website" {
  bucket = aws_s3_bucket.bucket-tools-uri.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "bucket-tools-uri-ownership-controls" {
  bucket = aws_s3_bucket.bucket-tools-uri.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "bucket-tools-uri-acl" {
  bucket = aws_s3_bucket.bucket-tools-uri.id

  acl = "public-read"
  depends_on = [
    aws_s3_bucket_ownership_controls.bucket-tools-uri-ownership-controls,
    aws_s3_bucket_public_access_block.bucket-tools-uri-public-access-block
  ]
}


resource "aws_s3_bucket_policy" "bucket-tools-uri-policy" {
  bucket = aws_s3_bucket.bucket-tools-uri.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          aws_s3_bucket.bucket-tools-uri.arn,
          "${aws_s3_bucket.bucket-tools-uri.arn}/*",
        ]
      },
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.bucket-tools-uri-public-access-block
  ]
}

module "template_files" {
  source = "hashicorp/dir/template"

  base_dir = "${path.module}/../dist"
}

locals {
  # Mapeia extensões de arquivo para seus tipos de conteúdo (MIME types).
  mime_types = {
    "css"  = "text/css"
    "html" = "text/html"
    "js"   = "application/javascript"
    "svg"  = "image/svg+xml"
  }
}

resource "aws_s3_object" "bucket-tools-uri-object" {
  bucket = aws_s3_bucket.bucket-tools-uri.bucket

  for_each = module.template_files.files

  # A chave do objeto no S3 é o nome do arquivo sem a extensão '.gz'.
  key = trimsuffix(each.key, ".gz")

  # O tipo de conteúdo é baseado na extensão do arquivo *original*.
  content_type = lookup(local.mime_types, regex("\\.([^.]+)$", trimsuffix(each.key, ".gz"))[0], "application/octet-stream")

  # Define o Content-Encoding como 'gzip' se o arquivo for comprimido.
  content_encoding = endswith(each.key, ".gz") ? "gzip" : null

  # Política de cache: arquivos com hash são imutáveis.
  cache_control = strcontains(trimsuffix(each.key, ".gz"), "-") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate"

  # Usa o arquivo do disco como fonte e o ETag para detectar mudanças.
  source = each.value.source_path
  etag   = each.value.digests.md5
}

data "aws_route53_zone" "cafesao-zone" {
  name = "cafesao.net"
}

resource "aws_route53_record" "tools-uri-record" {
  zone_id = data.aws_route53_zone.cafesao-zone.zone_id
  name = "tools-uri.cafesao.net"
  type = "A"
  alias {
    name = aws_s3_bucket_website_configuration.bucket-tools-uri-website.website_domain
    zone_id = aws_s3_bucket.bucket-tools-uri.hosted_zone_id
    evaluate_target_health = false
  }
  depends_on = [ aws_s3_bucket_website_configuration.bucket-tools-uri-website ]
}

output "website_url" {
  description = "The URL of the website"
  value       = "http://${aws_route53_record.tools-uri-record.name}"
}
