import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, FileText, Hash, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [params, setParams] = useState<Array<{ key: string; value: string }>>(
    [],
  );
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [activeTab, setActiveTab] = useState<"encode" | "decode" | "params">(
    "encode",
  );

  const handleEncode = () => {
    try {
      // Se parece ser uma URL completa, codifica apenas os parâmetros
      if (input.match(/^https?:\/\//)) {
        const url = new URL(input);
        const params = new URLSearchParams(url.search);
        const encodedParams = new URLSearchParams();

        params.forEach((value, key) => {
          encodedParams.append(key, value);
        });

        url.search = encodedParams.toString();
        setEncoded(url.toString());
      } else {
        // Se não for uma URL, codifica normalmente
        setEncoded(encodeURIComponent(input));
      }
    } catch {
      setEncoded("Erro ao codificar");
    }
  };

  const handleDecode = () => {
    try {
      setDecoded(decodeURIComponent(input));
    } catch {
      setDecoded("Erro ao decodificar");
    }
  };

  const handleParseParams = () => {
    try {
      const url = new URL(
        input.startsWith("http") ? input : `http://example.com${input}`,
      );
      const urlParams = new URLSearchParams(url.search);
      const paramsArray: Array<{ key: string; value: string }> = [];

      urlParams.forEach((value, key) => {
        paramsArray.push({ key, value });
      });

      setParams(paramsArray);
    } catch {
      setParams([]);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [id]: true });
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const tabs = [
    { id: "encode", label: "Codificar", icon: Link, action: handleEncode },
    { id: "decode", label: "Decodificar", icon: Hash, action: handleDecode },
    {
      id: "params",
      label: "Parâmetros",
      icon: FileText,
      action: handleParseParams,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-purple-900 mb-4">URI Tools</h1>
          <p className="text-purple-700 text-lg">
            Codifique, decodifique e analise URIs com facilidade
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden"
        >
          <div className="flex border-b border-purple-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-800 border-b-2 border-purple-600"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="input-textarea"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {activeTab === "encode" && "Texto para codificar"}
                  {activeTab === "decode" && "URI para decodificar"}
                  {activeTab === "params" && "URL ou query string"}
                </label>
                <textarea
                  id="input-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeTab === "encode"
                      ? "Digite o texto para codificar..."
                      : activeTab === "decode"
                        ? "Digite a URI codificada..."
                        : "Cole uma URL completa ou query string (?param1=value1&param2=value2)"
                  }
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                />
              </div>

              <Button
                onClick={tabs.find((tab) => tab.id === activeTab)?.action}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </Button>

              <AnimatePresence mode="wait">
                {activeTab === "encode" && encoded && (
                  <motion.div
                    key="encoded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-purple-800">
                        Resultado codificado:
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(encoded, "encoded")}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        {copiedStates.encoded ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-gray-800 break-all font-mono text-sm">
                      {encoded}
                    </p>
                  </motion.div>
                )}

                {activeTab === "decode" && decoded && (
                  <motion.div
                    key="decoded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-purple-800">
                        Resultado decodificado:
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(decoded, "decoded")}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        {copiedStates.decoded ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-gray-800 break-all">{decoded}</p>
                  </motion.div>
                )}

                {activeTab === "params" && params.length > 0 && (
                  <motion.div
                    key="params"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-6 space-y-3"
                  >
                    <h3 className="text-sm font-medium text-purple-800 mb-3">
                      Parâmetros encontrados:
                    </h3>
                    {params.map((param, index) => (
                      <motion.div
                        key={`${param.key}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-mono text-sm text-purple-700 font-medium">
                              {param.key}
                            </div>
                            <div className="font-mono text-sm text-gray-700 mt-1 break-all">
                              {param.value}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              copyToClipboard(
                                `${param.key}=${param.value}`,
                                `param-${index}`,
                              )
                            }
                            className="ml-4 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            {copiedStates[`param-${index}`] ? (
                              <Check size={18} className="text-green-600" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <footer className="mt-12 text-center text-purple-600 text-sm">
          <p>Feito com 💜 para desenvolvedores</p>
        </footer>
      </div>
    </div>
  );
}
