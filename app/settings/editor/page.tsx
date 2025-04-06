"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditorSettingsPage() {
  const [settings, setSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    autoSave: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const router = useRouter()

  // Load settings from localStorage on initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem("mistalic-editor-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error loading editor settings:", error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings to localStorage
      localStorage.setItem("mistalic-editor-settings", JSON.stringify(settings))

      // Show success message
      setMessage({ text: "Settings saved successfully", type: "success" })

      // Apply settings immediately
      applyEditorSettings(settings)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
        // Navigate back to the editor
        router.push("/")
      }, 1500)
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage({ text: "Error saving settings", type: "error" })
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to apply editor settings
  const applyEditorSettings = (settings) => {
    // This would normally update the Monaco editor instance
    // For now, we'll just dispatch a custom event that the editor component can listen for
    const event = new CustomEvent("editorSettingsChanged", { detail: settings })
    window.dispatchEvent(event)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/settings" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Settings
        </Link>
        <div className="text-blue-400 font-semibold">Mistalic - Editor Settings</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Editor Settings</h1>

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

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number.parseInt(e.target.value) })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="8"
                  max="32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tab Size</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => setSettings({ ...settings, tabSize: Number.parseInt(e.target.value) })}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="8">8 spaces</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wordWrap"
                  checked={settings.wordWrap}
                  onChange={(e) => setSettings({ ...settings, wordWrap: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="wordWrap" className="text-sm font-medium">
                  Word Wrap
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="minimap"
                  checked={settings.minimap}
                  onChange={(e) => setSettings({ ...settings, minimap: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="minimap" className="text-sm font-medium">
                  Show Minimap
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lineNumbers"
                  checked={settings.lineNumbers}
                  onChange={(e) => setSettings({ ...settings, lineNumbers: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="lineNumbers" className="text-sm font-medium">
                  Show Line Numbers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="autoSave" className="text-sm font-medium">
                  Auto Save
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

