"use client"

import { useState } from "react"
import { MessageSquarePlus, ArrowRight, Loader } from "lucide-react"

interface CodeCompletionProps {
  code: string
  language: string
  onInsertCode: (code: string) => void
}

export default function CodeCompletion({ code, language, onInsertCode }: CodeCompletionProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const generateCode = async () => {
    if (!prompt.trim()) return

    try {
      setIsGenerating(true)
      setResult("")

      const response = await fetch("/api/mistral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Current code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nUser request: ${prompt}\n\nProvide only the code snippet to insert with no additional text or explanation:`,
          model: "mistral-small-latest",
          systemPrompt:
            "You are an expert coding assistant. When asked to provide code, respond only with the code snippet, no explanations or markdown.",
        }),
      })

      const data = await response.json()

      if (data.success && data.text) {
        setResult(data.text)
      } else {
        setResult("Error: " + (data.error || "Failed to generate code"))
      }
    } catch (error) {
      console.error("Error generating code:", error)
      setResult("Error generating code. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInsert = () => {
    onInsertCode(result)
    setIsOpen(false)
    setPrompt("")
    setResult("")
  }

  return (
    <div className="absolute bottom-4 right-4 z-10">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
          title="Code Completion"
        >
          <MessageSquarePlus size={20} />
        </button>
      ) : (
        <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-80">
          <div className="p-3 border-b border-[#3c3c3c]">
            <h3 className="text-sm font-semibold">AI Code Completion</h3>
            <p className="text-xs text-gray-400 mt-1">Describe what code you need</p>
          </div>

          <div className="p-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Add a function to calculate fibonacci sequence"
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
            />

            <div className="flex mt-2">
              <button onClick={() => setIsOpen(false)} className="text-xs text-gray-400 hover:text-white mr-auto">
                Cancel
              </button>

              <button
                onClick={generateCode}
                disabled={isGenerating || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader size={12} className="animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate
                    <ArrowRight size={12} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="p-3 border-t border-[#3c3c3c]">
              <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs font-mono max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleInsert}
                  className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs"
                >
                  Insert Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

