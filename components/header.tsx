"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, X, ChevronDown, Settings, Save, FileCode, Upload, Download } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  onSave?: () => void
  onExport?: (format: "json" | "js") => void
  onImport?: (fileName: string, content: string) => void
  currentFile?: any
}

export default function Header({ onSave, onExport, onImport, currentFile }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleImportJson = () => {
    // Create a hidden file input element
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string

          // Basic validation before passing to import handler
          if (!content || typeof content !== "string") {
            throw new Error("File is empty or not readable as text")
          }

          // Trigger import event
          if (onImport) {
            onImport(file.name, content)
          }
        } catch (error) {
          console.error("Error reading JSON file:", error)
          alert(`Error reading file: ${error.message || "The file could not be read."}`)
        }
      }

      reader.onerror = () => {
        alert("Error reading the file. Please try again with a different file.")
      }

      reader.readAsText(file)
    }

    input.click()
    setActiveDropdown(null)
  }

  const handleOpenJs = () => {
    // Create a hidden file input element
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".js"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string

          // Basic validation before passing to import handler
          if (!content || typeof content !== "string") {
            throw new Error("File is empty or not readable as text")
          }

          // Trigger import event
          if (onImport) {
            onImport(file.name, content)
          }
        } catch (error) {
          console.error("Error reading JS file:", error)
          alert(`Error reading file: ${error.message || "The file could not be read."}`)
        }
      }

      reader.onerror = () => {
        alert("Error reading the file. Please try again with a different file.")
      }

      reader.readAsText(file)
    }

    input.click()
    setActiveDropdown(null)
  }

  const handleExportJson = () => {
    if (!currentFile) {
      alert("No file is currently open")
      return
    }

    try {
      let content = currentFile.content
      let fileName = currentFile.name
      let jsonData

      // If it's already a JSON file, just validate it
      if (fileName.endsWith(".json")) {
        // Validate the JSON
        try {
          jsonData = JSON.parse(content)
        } catch (error) {
          throw new Error("The current file contains invalid JSON.")
        }
      } else {
        // Try to parse the content as JavaScript and extract the agent object
        const agentMatch =
          content.match(/const\s+\w+\s*=\s*({[\s\S]*?});/) ||
          content.match(/let\s+\w+\s*=\s*({[\s\S]*?});/) ||
          content.match(/var\s+\w+\s*=\s*({[\s\S]*?});/)

        if (agentMatch && agentMatch[1]) {
          try {
            // Use Function constructor instead of eval for better security
            jsonData = new Function(`return ${agentMatch[1]}`)()
          } catch (error) {
            console.error("Error evaluating JS object:", error)
            throw new Error("Could not parse JavaScript object: " + (error as Error).message)
          }
        } else {
          throw new Error("Could not extract valid JSON from the file. Make sure it contains a JavaScript object.")
        }
      }

      // Format the agent object as JSON
      content = JSON.stringify(jsonData, null, 2)
      fileName = fileName.replace(/\.\w+$/, ".json")

      // Create a blob and download it
      const blob = new Blob([content], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting to JSON:", error)
      alert(`Could not export to JSON: ${(error as Error).message}`)
    }

    setActiveDropdown(null)
  }

  const handleSaveJs = () => {
    if (!currentFile) {
      alert("No file is currently open")
      return
    }

    try {
      // Create a blob and download it
      const blob = new Blob([currentFile.content], { type: "text/javascript" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = currentFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Also save to localStorage if onSave is provided
      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error("Error saving JS file:", error)
      alert(`Could not save JS file: ${(error as Error).message}`)
    }

    setActiveDropdown(null)
  }

  return (
    <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center justify-between px-4">
      <div className="flex items-center">
        <Link href="/" className="text-blue-400 font-semibold mr-6 flex items-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M12 2L4 6V18L12 22L20 18V6L12 2Z"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 22V14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 6L12 14L4 6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 18L12 14L20 18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Mistalic
        </Link>
        <div className="hidden md:flex space-x-4 text-sm" ref={dropdownRef}>
          <div className="group relative">
            <button
              className={`hover:bg-[#3c3c3c] px-3 py-1 rounded flex items-center ${activeDropdown === "file" ? "bg-[#3c3c3c]" : ""}`}
              onClick={() => toggleDropdown("file")}
            >
              File <ChevronDown size={14} className="ml-1" />
            </button>
            {activeDropdown === "file" && (
              <div className="absolute bg-[#252526] border border-[#3c3c3c] rounded shadow-lg w-48 z-10">
                <ul>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer flex items-center" onClick={handleSaveJs}>
                    <Save size={14} className="mr-2" /> Save JS File
                  </li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer flex items-center" onClick={handleOpenJs}>
                    <FileCode size={14} className="mr-2" /> Open JS File
                  </li>
                  <li className="border-t border-[#3c3c3c]"></li>
                  <li
                    className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer flex items-center"
                    onClick={handleImportJson}
                  >
                    <Upload size={14} className="mr-2" /> Import JSON
                  </li>
                  <li
                    className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer flex items-center"
                    onClick={handleExportJson}
                  >
                    <Download size={14} className="mr-2" /> Export to JSON
                  </li>
                  <li className="border-t border-[#3c3c3c]"></li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Exit</li>
                </ul>
              </div>
            )}
          </div>
          <div className="group relative">
            <button
              className={`hover:bg-[#3c3c3c] px-3 py-1 rounded flex items-center ${activeDropdown === "edit" ? "bg-[#3c3c3c]" : ""}`}
              onClick={() => toggleDropdown("edit")}
            >
              Edit <ChevronDown size={14} className="ml-1" />
            </button>
            {activeDropdown === "edit" && (
              <div className="absolute bg-[#252526] border border-[#3c3c3c] rounded shadow-lg w-48 z-10">
                <ul>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Undo</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Redo</li>
                  <li className="border-t border-[#3c3c3c] hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Cut</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Copy</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Paste</li>
                  <li className="border-t border-[#3c3c3c] hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Find</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Replace</li>
                </ul>
              </div>
            )}
          </div>
          <div className="group relative">
            <button
              className={`hover:bg-[#3c3c3c] px-3 py-1 rounded flex items-center ${activeDropdown === "view" ? "bg-[#3c3c3c]" : ""}`}
              onClick={() => toggleDropdown("view")}
            >
              View <ChevronDown size={14} className="ml-1" />
            </button>
            {activeDropdown === "view" && (
              <div className="absolute bg-[#252526] border border-[#3c3c3c] rounded shadow-lg w-48 z-10">
                <ul>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Explorer</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Search</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Terminal</li>
                  <li className="border-t border-[#3c3c3c] hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">
                    <Link href="/settings/editor" className="block w-full">
                      Editor Settings
                    </Link>
                  </li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">
                    <Link href="/settings/theme" className="block w-full">
                      Theme Settings
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="group relative">
            <button
              className={`hover:bg-[#3c3c3c] px-3 py-1 rounded flex items-center ${activeDropdown === "ai" ? "bg-[#3c3c3c]" : ""}`}
              onClick={() => toggleDropdown("ai")}
            >
              AI <ChevronDown size={14} className="ml-1" />
            </button>
            {activeDropdown === "ai" && (
              <div className="absolute bg-[#252526] border border-[#3c3c3c] rounded shadow-lg w-48 z-10">
                <ul>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Generate Code</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Explain Code</li>
                  <li className="hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">Optimize Code</li>
                  <li className="border-t border-[#3c3c3c] hover:bg-[#3c3c3c] px-4 py-2 cursor-pointer">
                    <Link href="/agents/create" className="block w-full">
                      Create Agent
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentFile && <span className="text-xs text-gray-400 mr-2">{currentFile.name}</span>}
        <Link href="/settings" className="hover:bg-[#3c3c3c] p-1 rounded">
          <Settings size={18} />
        </Link>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="hover:bg-[#3c3c3c] p-1 rounded">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-10 left-0 right-0 bg-[#252526] border-b border-[#3c3c3c] md:hidden z-10">
          <div className="flex flex-col p-2">
            <button
              className="hover:bg-[#3c3c3c] px-4 py-2 text-left"
              onClick={() => {
                setActiveDropdown(activeDropdown === "file-mobile" ? null : "file-mobile")
              }}
            >
              File
              {activeDropdown === "file-mobile" && (
                <div className="pl-4 mt-1">
                  <button
                    className="hover:bg-[#3c3c3c] px-2 py-1 text-left w-full flex items-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveJs()
                      setMenuOpen(false)
                    }}
                  >
                    <Save size={14} className="mr-2" /> Save JS File
                  </button>
                  <button
                    className="hover:bg-[#3c3c3c] px-2 py-1 text-left w-full flex items-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportJson()
                      setMenuOpen(false)
                    }}
                  >
                    <Download size={14} className="mr-2" /> Export to JSON
                  </button>
                </div>
              )}
            </button>
            <button className="hover:bg-[#3c3c3c] px-4 py-2 text-left">Edit</button>
            <button className="hover:bg-[#3c3c3c] px-4 py-2 text-left">View</button>
            <button className="hover:bg-[#3c3c3c] px-4 py-2 text-left">AI</button>
          </div>
        </div>
      )}
    </header>
  )
}

