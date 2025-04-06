"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState({
    name: "dark",
    accentColor: "#007acc",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const router = useRouter()

  // Load theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("mistalic-theme")
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (error) {
        console.error("Error loading theme settings:", error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save theme to localStorage
      localStorage.setItem("mistalic-theme", JSON.stringify(theme))

      // Apply theme immediately
      applyTheme(theme)

      setMessage({ text: "Theme settings saved successfully", type: "success" })
      setTimeout(() => {
        setMessage({ text: "", type: "" })
        // Navigate back to the editor
        router.push("/")
      }, 1500)
    } catch (error) {
      console.error("Error saving theme settings:", error)
      setMessage({ text: "Error saving theme settings", type: "error" })
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to apply theme
  const applyTheme = (theme) => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme.name)

    // Apply accent color as CSS variables
    document.documentElement.style.setProperty("--accent-color", theme.accentColor)

    // Apply additional theme-specific styles
    if (theme.name === "light") {
      document.body.classList.add("light-theme")
      document.body.classList.remove("dark-theme", "high-contrast-theme")
    } else if (theme.name === "high-contrast") {
      document.body.classList.add("high-contrast-theme")
      document.body.classList.remove("dark-theme", "light-theme")
    } else {
      document.body.classList.add("dark-theme")
      document.body.classList.remove("light-theme", "high-contrast-theme")
    }

    // Dispatch a custom event that other components can listen for
    const event = new CustomEvent("themeChanged", { detail: theme })
    window.dispatchEvent(event)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/settings" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Settings
        </Link>
        <div className="text-blue-400 font-semibold">Mistalic - Theme Settings</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Theme Settings</h1>

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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.name === "dark" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, name: "dark" })}
                >
                  <div className="h-20 bg-[#1e1e1e] border border-[#3c3c3c] rounded mb-2"></div>
                  <div className="text-center">Dark</div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.name === "light" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, name: "light" })}
                >
                  <div className="h-20 bg-[#f5f5f5] border border-[#e0e0e0] rounded mb-2"></div>
                  <div className="text-center">Light</div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.name === "high-contrast" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, name: "high-contrast" })}
                >
                  <div className="h-20 bg-black border border-[#6fc3df] rounded mb-2"></div>
                  <div className="text-center">High Contrast</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.accentColor === "#007acc" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, accentColor: "#007acc" })}
                >
                  <div className="h-10 bg-[#007acc] rounded mb-2"></div>
                  <div className="text-center">Blue</div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.accentColor === "#6b46c1" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, accentColor: "#6b46c1" })}
                >
                  <div className="h-10 bg-[#6b46c1] rounded mb-2"></div>
                  <div className="text-center">Purple</div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.accentColor === "#16a34a" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, accentColor: "#16a34a" })}
                >
                  <div className="h-10 bg-[#16a34a] rounded mb-2"></div>
                  <div className="text-center">Green</div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme.accentColor === "#dc2626" ? "border-blue-500 bg-[#1e1e1e]" : "border-[#3c3c3c]"}`}
                  onClick={() => setTheme({ ...theme, accentColor: "#dc2626" })}
                >
                  <div className="h-10 bg-[#dc2626] rounded mb-2"></div>
                  <div className="text-center">Red</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
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
                    Save Theme
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

