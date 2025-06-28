# URI Tools

Uma ferramenta simples e rápida para codificar, decodificar e analisar URIs e seus parâmetros.

Site: [tools-uri.cafesao.net](http://tools-uri.cafesao.net)

## Tecnologias

- **Frontend**: React com Vite, TypeScript e Tailwind CSS
- **Infraestrutura**: Terraform
- **Cloud**: AWS S3 (para hospedagem estática) e Route 53 (para DNS)

---

## Aviso sobre a Funcionalidade "Copiar para a Área de Transferência"

A funcionalidade de copiar o resultado ou os parâmetros foi intencionalmente removida.

### Motivo

A API do navegador `navigator.clipboard.writeText()`, usada para essa funcionalidade, é considerada uma operação sensível e, por questões de segurança, os navegadores modernos exigem que ela seja executada em um **"contexto seguro"**.

Um contexto seguro é, na maioria das vezes, uma página servida via **HTTPS**.

A configuração atual do projeto utiliza a hospedagem de site estático do AWS S3, que serve o conteúdo via **HTTP**. Por esse motivo, a chamada à API de clipboard falhava em produção (no ambiente da nuvem), embora funcionasse perfeitamente em desenvolvimento (`localhost`), que é tratado como um contexto seguro.

### Solução Recomendada

A solução padrão e recomendada na AWS para habilitar HTTPS em um site estático é colocar uma distribuição do **Amazon CloudFront** na frente do bucket S3. O CloudFront atua como um CDN, fornecendo um certificado SSL/TLS gratuito (via AWS Certificate Manager) e melhorando a performance e a segurança do site.

Por questões de simplicidade neste momento, optou-se por remover a funcionalidade em vez de adicionar o CloudFront à infraestrutura.

## Run

Development mode:

```bash
pnpm dev
```
