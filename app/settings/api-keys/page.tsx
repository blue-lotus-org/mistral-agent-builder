"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Plus, Trash } from "lucide-react"
import Link from "next/link"

interface ApiKey {
  id: string
  name: string
  key: string
  provider: string
}

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<Partial<ApiKey>>({
    name: "",
    key: "",
    provider: "mistral",
  })
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Load API keys from localStorage on initial load
  useEffect(() => {
    const savedKeys = localStorage.getItem("mistalic-api-keys")
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys))
      } catch (error) {
        console.error("Error loading API keys:", error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (!newKey.name || !newKey.key) {
        setMessage({ text: "Name and API key are required", type: "error" })
        setTimeout(() => setMessage({ text: "", type: "" }), 3000)
        setIsSaving(false)
        return
      }

      const updatedKeys = [
        ...apiKeys,
        {
          id: Date.now().toString(),
          name: newKey.name,
          key: newKey.key,
          provider: newKey.provider || "mistral",
        },
      ]

      setApiKeys(updatedKeys)
      localStorage.setItem("mistalic-api-keys", JSON.stringify(updatedKeys))

      // Reset form
      setNewKey({
        name: "",
        key: "",
        provider: "mistral",
      })

      setMessage({ text: "API key added successfully", type: "success" })
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } catch (error) {
      console.error("Error saving API key:", error)
      setMessage({ text: "Error saving API key", type: "error" })
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteKey = (id: string) => {
    const updatedKeys = apiKeys.filter((key) => key.id !== id)
    setApiKeys(updatedKeys)
    localStorage.setItem("mistalic-api-keys", JSON.stringify(updatedKeys))

    setMessage({ text: "API key deleted", type: "success" })
    setTimeout(() => setMessage({ text: "", type: "" }), 3000)
  }

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/settings" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Settings
        </Link>
        <div className="text-blue-400 font-semibold">Mistalic - API Keys</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">API Keys</h1>

          {message.text && (
            <div
              className={`${
                message.type === "error"
                  ? "bg-red-900/30 border-red-800 text-red-300"
                  : "bg-green-900/30 border-green-800 text-green-300"
              } border px-4 py-2 rounded mb-6`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Add New API Key</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="My Mistral API Key"
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Provider</label>
                <select
                  value={newKey.provider}
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="mistral">Mistral AI</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google AI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add API Key
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Your API Keys</h2>

            {apiKeys.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No API keys added yet</div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-[#3c3c3c] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{key.name}</div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => toggleShowKey(key.id)} className="text-gray-400 hover:text-gray-300">
                          {showKeys[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => deleteKey(key.id)} className="text-red-400 hover:text-red-300">
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Provider: {key.provider.charAt(0).toUpperCase() + key.provider.slice(1)}
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 font-mono text-sm">
                      {showKeys[key.id] ? key.key : "•".repeat(Math.min(24, key.key.length))}
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

