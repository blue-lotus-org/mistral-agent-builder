"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    model: "mistral-small-latest",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/agents")
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (err) {
      console.error("Error fetching agents:", err)
      setError("Failed to fetch agents")
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (e) => {
    e.preventDefault()

    if (!newAgent.name || !newAgent.description) {
      setError("Name and description are required")
      return
    }

    try {
      setIsCreating(true)
      setError("")

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgent),
      })

      const data = await response.json()

      if (data.success) {
        setAgents([...agents, data.agent])
        setNewAgent({
          name: "",
          description: "",
          model: "mistral-small-latest",
        })
        setSuccess(`Agent "${data.agent.name}" created successfully! Agent ID saved to .env file.`)
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || "Failed to create agent")
      }
    } catch (err) {
      console.error("Error creating agent:", err)
      setError("Failed to create agent")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to IDE
        </Link>
        <div className="text-blue-400 font-semibold">Mistalic - AI Agents</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Users size={24} className="mr-2 text-blue-400" />
            <h1 className="text-2xl font-semibold">AI Agents</h1>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded mb-4">{error}</div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-2 rounded mb-4">
              {success}
            </div>
          )}

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <Plus size={18} className="mr-2 text-blue-400" />
              <h2 className="text-lg font-medium">Create New Agent</h2>
            </div>

            <form onSubmit={createAgent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Code Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <select
                    value={newAgent.model}
                    onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
                  placeholder="Describe what this agent does..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
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

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Your Agents</h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No agents created yet</div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border border-[#3c3c3c] rounded p-4 hover:bg-[#2a2a2a]">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-blue-400">{agent.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">{agent.model}</span>
                        <Link
                          href={`/?agent=${agent.id}`}
                          className="ml-2 text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-900/20"
                        >
                          Edit
                        </Link>
                        <button className="ml-2 text-red-400 hover:text-red-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      ID: {agent.id} • Created: {new Date(agent.created).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

