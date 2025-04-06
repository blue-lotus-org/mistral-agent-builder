"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateAgentPage() {
  const router = useRouter()
  const [agent, setAgent] = useState({
    name: "",
    description: "",
    model: "mistral-small-latest",
    systemPrompt: "You are a helpful AI assistant that specializes in coding and software development.",
    functions: [] as any[],
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [functionName, setFunctionName] = useState("")
  const [functionDescription, setFunctionDescription] = useState("")

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agent.name || !agent.description) {
      setError("Name and description are required")
      return
    }

    try {
      setIsCreating(true)
      setError("")

      // Create agent
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agent),
      })

      const data = await response.json()

      if (data.success) {
        // Save agent ID to .env
        const saveResponse = await fetch("/api/agents/save-env", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: `AGENT_${agent.name.toUpperCase().replace(/\s+/g, "_")}_ID`,
            value: data.agent.id,
          }),
        })

        // Navigate back to agents page
        router.push("/agents?success=Agent created successfully")
      } else {
        setError(data.error || "Failed to create agent")
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      setError("Failed to create agent")
    } finally {
      setIsCreating(false)
    }
  }

  const addFunction = () => {
    if (!functionName || !functionDescription) return

    setAgent({
      ...agent,
      functions: [
        ...agent.functions,
        {
          name: functionName,
          description: functionDescription,
        },
      ],
    })

    setFunctionName("")
    setFunctionDescription("")
  }

  const removeFunction = (index: number) => {
    setAgent({
      ...agent,
      functions: agent.functions.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/agents" className="text-blue-400 hover:text-blue-300 flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Back to Agents
        </Link>
        <div className="text-blue-400 font-semibold mx-auto">Create New Agent</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded mb-4">{error}</div>
          )}

          <form onSubmit={createAgent}>
            <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Name *</label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Code Assistant"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <select
                    value={agent.model}
                    onChange={(e) => setAgent({ ...agent, model: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="mistral-small-latest">Mistral Small (Free)</option>
                    <option value="mistral-medium-latest" disabled>
                      Mistral Medium (Paid)
                    </option>
                    <option value="mistral-large-latest" disabled>
                      Mistral Large (Paid)
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={agent.description}
                  onChange={(e) => setAgent({ ...agent, description: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
                  placeholder="Describe what this agent does..."
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">System Prompt</label>
                <textarea
                  value={agent.systemPrompt}
                  onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
                  placeholder="System instructions for the AI model..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Instructions that define how the agent should behave</p>
              </div>
            </div>

            <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium mb-4">Functions</h2>
              <p className="text-sm text-gray-400 mb-4">Define functions that your agent can call</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Function Name</label>
                  <input
                    type="text"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., generateCode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={functionDescription}
                    onChange={(e) => setFunctionDescription(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Generate code based on a description"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={addFunction}
                  disabled={!functionName || !functionDescription}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Add Function
                </button>
              </div>

              {agent.functions.length > 0 && (
                <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#3c3c3c]">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Description</th>
                        <th className="py-2 px-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.functions.map((func, index) => (
                        <tr key={index} className="border-b border-[#3c3c3c] last:border-none">
                          <td className="py-2 px-4">{func.name}</td>
                          <td className="py-2 px-4">{func.description}</td>
                          <td className="py-2 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeFunction(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreating || !agent.name || !agent.description}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

