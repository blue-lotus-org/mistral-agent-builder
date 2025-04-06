"use client"

import { useState, useEffect, useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Maximize2, Minimize2, Save } from "lucide-react"

export interface FileInfo {
  name: string
  path: string
  content: string
  language: string
}

interface EditorProps {
  currentFile: FileInfo
  onFileChange: (content: string) => void
  files: FileInfo[]
  openFile: (path: string) => void
  saveFile: () => Promise<boolean>
}

export default function CodeEditor({ currentFile, onFileChange, files, openFile, saveFile }: EditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: { enabled: true },
    lineNumbers: true,
    autoSave: false,
  })

  // Load editor settings from localStorage on initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem("mistalic-editor-settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setEditorSettings({
          ...settings,
          minimap: { enabled: settings.minimap },
        })
      } catch (error) {
        console.error("Error loading editor settings:", error)
      }
    }
  }, [])

  // Listen for editor settings changes
  useEffect(() => {
    const handleEditorSettingsChanged = (event: CustomEvent) => {
      const settings = event.detail
      setEditorSettings({
        ...settings,
        minimap: { enabled: settings.minimap },
      })

      // Update editor options if editor is mounted
      if (editorRef.current) {
        editorRef.current.updateOptions({
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? "on" : "off",
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers ? "on" : "off",
        })
      }
    }

    window.addEventListener("editorSettingsChanged", handleEditorSettingsChanged as EventListener)
    return () => {
      window.removeEventListener("editorSettingsChanged", handleEditorSettingsChanged as EventListener)
    }
  }, [])

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChanged = (event: CustomEvent) => {
      const theme = event.detail

      // Update editor theme if editor is mounted
      if (monacoRef.current && editorRef.current) {
        const monaco = monacoRef.current

        // Apply theme to editor
        if (theme.name === "light") {
          monaco.editor.setTheme("vs")
        } else if (theme.name === "high-contrast") {
          monaco.editor.setTheme("hc-black")
        } else {
          monaco.editor.setTheme("vs-dark")
        }

        // Force editor to refresh
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.layout()
          }
        }, 100)
      }
    }

    window.addEventListener("themeChanged", handleThemeChanged as EventListener)
    return () => {
      window.removeEventListener("themeChanged", handleThemeChanged as EventListener)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    let autoSaveInterval: NodeJS.Timeout | null = null

    if (editorSettings.autoSave) {
      autoSaveInterval = setInterval(() => {
        handleSave()
      }, 30000) // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
      }
    }
  }, [editorSettings.autoSave])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Set up editor options
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      minimap: editorSettings.minimap,
      wordWrap: editorSettings.wordWrap ? "on" : "off",
      lineNumbers: editorSettings.lineNumbers ? "on" : "off",
      tabSize: editorSettings.tabSize,
      scrollBeyondLastLine: false,
      automaticLayout: true,
    })

    // Apply theme from localStorage
    const savedTheme = localStorage.getItem("mistalic-theme")
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        if (theme.name === "light") {
          monaco.editor.setTheme("vs")
        } else if (theme.name === "high-contrast") {
          monaco.editor.setTheme("hc-black")
        } else {
          monaco.editor.setTheme("vs-dark")
        }
      } catch (error) {
        console.error("Error applying theme:", error)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage("")

    try {
      const success = await saveFile()
      if (success) {
        setSaveMessage("Saved successfully")
        setTimeout(() => setSaveMessage(""), 2000)
      } else {
        setSaveMessage("Error saving file")
        setTimeout(() => setSaveMessage(""), 2000)
      }
    } catch (error) {
      console.error("Error saving file:", error)
      setSaveMessage("Error saving file")
      setTimeout(() => setSaveMessage(""), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Determine the language based on file extension
  const getLanguage = () => {
    // If language is already set, use it
    if (currentFile.language) {
      return currentFile.language
    }

    // Otherwise, determine from file extension
    const extension = currentFile.name.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "js":
        return "javascript"
      case "ts":
        return "typescript"
      case "jsx":
        return "javascriptreact"
      case "tsx":
        return "typescriptreact"
      case "py":
        return "python"
      case "html":
        return "html"
      case "css":
        return "css"
      case "json":
        return "json"
      case "md":
        return "markdown"
      default:
        return "javascript"
    }
  }

  return (
    <div
      className={`relative flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-[#1e1e1e]" : "h-[calc(100vh-10rem)]"}`}
    >
      <div className="flex justify-between items-center bg-[#252526] border-b border-[#3c3c3c] px-4 py-1">
        <div className="flex items-center">
          <span className="text-sm text-gray-400">{currentFile.name}</span>
          {saveMessage && <span className="ml-4 text-xs text-green-400">{saveMessage}</span>}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="hover:bg-[#3c3c3c] p-1 rounded text-gray-300 disabled:opacity-50"
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="hover:bg-[#3c3c3c] p-1 rounded text-gray-300"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage()}
          value={currentFile.content}
          onChange={(value) => onFileChange(value || "")}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            fontSize: editorSettings.fontSize,
            minimap: editorSettings.minimap,
            wordWrap: editorSettings.wordWrap ? "on" : "off",
            lineNumbers: editorSettings.lineNumbers ? "on" : "off",
            tabSize: editorSettings.tabSize,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}

