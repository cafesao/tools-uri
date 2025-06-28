import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, FileText, Hash, Link } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
	const [input, setInput] = useState("");
	const [encoded, setEncoded] = useState("");
	const [decoded, setDecoded] = useState("");
	const [urlParams, setUrlParams] = useState<
		Array<{ key: string; value: string }>
	>([]);
	const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
		{},
	);
	const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
	const [hoveredParam, setHoveredParam] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);

	// Detecta automaticamente parâmetros quando o input muda
	useEffect(() => {
		try {
			const urlPattern = /^https?:\/\/|^\?|&/;
			if (urlPattern.test(input)) {
				const url = new URL(
					input.startsWith("http") ? input : `http://example.com${input}`,
				);
				const params = new URLSearchParams(url.search);
				const paramsArray: Array<{ key: string; value: string }> = [];

				params.forEach((value, key) => {
					paramsArray.push({ key, value });
				});

				setUrlParams(paramsArray);
			} else {
				setUrlParams([]);
			}
		} catch {
			setUrlParams([]);
		}
	}, [input]);

	// Sincroniza o scroll do highlight com o textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		const highlight = highlightRef.current;

		if (textarea && highlight) {
			const syncScroll = () => {
				highlight.scrollTop = textarea.scrollTop;
				highlight.scrollLeft = textarea.scrollLeft;
			};

			textarea.addEventListener("scroll", syncScroll);
			return () => textarea.removeEventListener("scroll", syncScroll);
		}
	}, []);

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
	];

	// Renderiza o texto com highlight
	const renderHighlightedText = () => {
		if (!hoveredParam || !input) return <>{input}</>;

		// Encontrar todas as ocorrências do parâmetro
		const regex = new RegExp(`([?&]${hoveredParam}=)([^&]*)`, "g");
		let lastIndex = 0;
		const parts = [];
		let match: RegExpExecArray | null = null;

		while (true) {
			match = regex.exec(input);
			if (match === null) break;
			// Adicionar texto antes do match
			if (match.index > lastIndex) {
				parts.push(
					<span key={`text-${lastIndex}`}>
						{input.substring(lastIndex, match.index)}
					</span>,
				);
			}

			// Adicionar o parâmetro destacado
			parts.push(
				<span
					key={`highlight-${match.index}`}
					className="bg-purple-300 text-purple-900 rounded px-0.5"
				>
					{match[0]}
				</span>,
			);

			lastIndex = match.index + match[0].length;
		}

		// Adicionar o texto restante
		if (lastIndex < input.length) {
			parts.push(
				<span key={`text-end-${lastIndex}`}>{input.substring(lastIndex)}</span>,
			);
		}

		return <>{parts}</>;
	};

	// Renderiza o resultado com highlight
	const renderHighlightedResult = (text: string) => {
		if (!hoveredParam || !text) return text;

		// Encontrar todas as ocorrências do parâmetro no resultado
		const regex = new RegExp(`([?&]${hoveredParam}=)([^&]*)`, "g");
		let lastIndex = 0;
		const parts = [];
		let match: RegExpExecArray | null = null;

		while (true) {
			match = regex.exec(text);
			if (match === null) break;
			// Adicionar texto antes do match
			if (match.index > lastIndex) {
				parts.push(
					<span key={`text-${lastIndex}`}>
						{text.substring(lastIndex, match.index)}
					</span>,
				);
			}

			// Adicionar o parâmetro destacado
			parts.push(
				<span
					key={`highlight-${match.index}`}
					className="bg-purple-300 text-purple-900 rounded px-0.5"
				>
					{match[0]}
				</span>,
			);

			lastIndex = match.index + match[0].length;
		}

		// Adicionar o texto restante
		if (lastIndex < text.length) {
			parts.push(
				<span key={`text-end-${lastIndex}`}>{text.substring(lastIndex)}</span>,
			);
		}

		return <>{parts}</>;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100">
			<div className="container mx-auto px-4 py-12 max-w-7xl">
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

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Coluna principal - 2/3 do espaço */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, delay: 0.1 }}
						className="lg:col-span-2"
					>
						<div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
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
										</label>
										<div className="relative">
											{/* Camada de highlight */}
											<div
												ref={highlightRef}
												className="absolute inset-0 px-4 py-3 pointer-events-none overflow-hidden whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-gray-600 font-normal"
												style={{
													fontFamily: "monospace",
													wordBreak: "break-all",
													fontWeight: "normal",
													textShadow: "none",
													textDecoration: "none",
													fontStyle: "normal",
												}}
											>
												{renderHighlightedText()}
											</div>
											{/* Textarea */}
											<textarea
												ref={textareaRef}
												id="input-textarea"
												value={input}
												onChange={(e) => setInput(e.target.value)}
												placeholder={
													activeTab === "encode"
														? "Digite o texto para codificar..."
														: "Digite a URI codificada..."
												}
												className={`relative w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 font-mono text-sm bg-transparent leading-relaxed font-normal text-transparent caret-black`}
												style={{
													fontFamily: "monospace",
													wordBreak: "break-all",
													fontWeight: "normal",
													textShadow: "none",
													textDecoration: "none",
													fontStyle: "normal",
													caretColor: "#000",
												}}
												rows={6}
											/>
										</div>
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
													{renderHighlightedResult(encoded)}
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
												<p className="text-gray-800 break-all">
													{renderHighlightedResult(decoded)}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Coluna lateral - 1/3 do espaço */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, delay: 0.2 }}
					>
						<div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden sticky top-6">
							<div className="bg-purple-100 px-6 py-4 border-b border-purple-200">
								<h3 className="font-semibold text-purple-900 flex items-center gap-2">
									<FileText size={20} />
									Parâmetros da URL
								</h3>
							</div>

							<div className="p-6">
								{urlParams.length > 0 ? (
									<div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
										{urlParams.map((param, index) => (
											<motion.div
												key={`${param.key}-${index}`}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.15, delay: index * 0.03 }}
												className="group"
												onMouseEnter={() => setHoveredParam(param.key)}
												onMouseLeave={() => setHoveredParam(null)}
											>
												<div
													className={`p-3 bg-purple-50 rounded-lg border transition-all duration-200 ${
														hoveredParam === param.key
															? "border-purple-400 bg-purple-100 shadow-md"
															: "border-purple-100 hover:border-purple-300"
													}`}
												>
													<div className="flex items-start justify-between gap-2">
														<div className="flex-1 min-w-0">
															<div className="font-mono text-xs text-purple-600 font-semibold truncate">
																{param.key}
															</div>
															<div className="font-mono text-xs text-gray-700 mt-1 break-all">
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
															className="p-1.5 text-purple-600 hover:text-purple-800 transition-colors opacity-0 group-hover:opacity-100"
															title="Copiar parâmetro"
														>
															{copiedStates[`param-${index}`] ? (
																<Check size={16} className="text-green-600" />
															) : (
																<Copy size={16} />
															)}
														</motion.button>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-12 text-gray-500">
										<FileText size={48} className="mx-auto mb-3 opacity-20" />
										<p className="text-sm">
											Cole uma URL para ver os parâmetros
										</p>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</div>

				<footer className="mt-12 text-center text-purple-600 text-sm">
					<p>
						Feito com 💜 para desenvolvedores -{" "}
						<a
							href="https://cafesao.net"
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							cafesao.net
						</a>
					</p>
				</footer>
			</div>

			<style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d8b4fe;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c084fc;
        }
      `}</style>
		</div>
	);
}
