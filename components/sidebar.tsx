"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  FilePlus,
  Search,
  TerminalIcon,
  SettingsIcon,
  Code,
  FileCode,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash,
  Play,
  Upload,
  Download,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SidebarProps {
  createNewFile: (fileName: string, content?: string, language?: string) => void
  openFile: (path: string) => void
  renameFile?: (oldPath: string, newName: string) => void
  deleteFile?: (path: string) => void
  exportFile?: (format: "json" | "js") => void
  files: any[]
  agents: any[]
}

export default function Sidebar({
  createNewFile,
  openFile,
  renameFile,
  deleteFile,
  exportFile,
  files = [],
  agents = [],
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState("explorer")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({
    files: true,
    agents: true,
  })
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    item: any
    type: string
  } | null>(null)
  const [renamingItem, setRenamingItem] = useState<{ path: string; name: string } | null>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus the new file input when it appears
  useEffect(() => {
    if (showNewFileInput && newFileInputRef.current) {
      newFileInputRef.current.focus()
    }
  }, [showNewFileInput])

  // Focus the rename input when renaming starts
  useEffect(() => {
    if (renamingItem && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingItem])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Search in files
    const fileResults = files
      .filter(
        (file) =>
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          file.content.toLowerCase().includes(query.toLowerCase()),
      )
      .map((file) => ({
        ...file,
        type: "file",
        matches: file.content.toLowerCase().includes(query.toLowerCase()) ? getContentMatches(file.content, query) : [],
      }))

    // Search in agents
    const agentResults = agents
      .filter(
        (agent) =>
          agent.name.toLowerCase().includes(query.toLowerCase()) ||
          (agent.description && agent.description.toLowerCase().includes(query.toLowerCase())),
      )
      .map((agent) => ({
        ...agent,
        type: "agent",
        matches: [],
      }))

    setSearchResults([...fileResults, ...agentResults])
  }

  const getContentMatches = (content: string, query: string) => {
    const matches = []
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query.toLowerCase())) {
        matches.push({
          line: i + 1,
          text: lines[i].trim(),
          preview: getLinePreview(lines[i], query),
        })
      }
    }

    return matches
  }

  const getLinePreview = (line: string, query: string) => {
    const index = line.toLowerCase().indexOf(query.toLowerCase())
    const start = Math.max(0, index - 20)
    const end = Math.min(line.length, index + query.length + 20)

    return (start > 0 ? "..." : "") + line.substring(start, end) + (end < line.length ? "..." : "")
  }

  const handleCreateNewFile = () => {
    if (newFileName.trim()) {
      createNewFile(newFileName.trim())
      setNewFileName("")
      setShowNewFileInput(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateNewFile()
    } else if (e.key === "Escape") {
      setNewFileName("")
      setShowNewFileInput(false)
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && renamingItem) {
      if (renameFile && renamingItem.name.trim()) {
        renameFile(renamingItem.path, renamingItem.name.trim())
      }
      setRenamingItem(null)
    } else if (e.key === "Escape") {
      setRenamingItem(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, item: any, type: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      type,
    })
  }

  const handleRename = () => {
    if (!contextMenu) return
    setRenamingItem({
      path: contextMenu.item.path,
      name: contextMenu.item.name,
    })
    setContextMenu(null)
  }

  const handleDelete = () => {
    if (!contextMenu) return
    if (deleteFile) {
      deleteFile(contextMenu.item.path)
    }
    setContextMenu(null)
  }

  const handleRun = () => {
    if (!contextMenu) return
    // Placeholder for running agents
    alert(`Running agent: ${contextMenu.item.name}`)
    setContextMenu(null)
  }

  const handleFileClick = (path: string) => {
    // Make sure the openFile function is called with the correct path
    console.log("Opening file:", path)
    openFile(path)
  }

  const handleAgentClick = (agent: any) => {
    // Create a temporary JSON file for the agent and open it
    const agentJson = JSON.stringify(agent, null, 2)
    const fileName = `${agent.name.replace(/\s+/g, "_")}.json`
    const path = `/${fileName}`

    // Check if the file already exists
    const existingFile = files.find((f) => f.path === path)
    if (existingFile) {
      openFile(path)
    } else {
      createNewFile(fileName, agentJson, "json")
    }
  }

  const handleSearchResultClick = (result: any) => {
    if (result.type === "file") {
      openFile(result.path)
    } else if (result.type === "agent") {
      handleAgentClick(result)
    }
  }

  const handleImportFile = () => {
    // Create a hidden file input element
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".js,.json,.ts,.tsx,.jsx,.html,.css"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string

        // Determine language based on file extension
        const extension = file.name.split(".").pop()?.toLowerCase()
        let language = "javascript"

        switch (extension) {
          case "js":
            language = "javascript"
            break
          case "ts":
            language = "typescript"
            break
          case "jsx":
            language = "javascriptreact"
            break
          case "tsx":
            language = "typescriptreact"
            break
          case "html":
            language = "html"
            break
          case "css":
            language = "css"
            break
          case "json":
            language = "json"
            break
        }

        // Create a new file with the imported content
        createNewFile(file.name, content, language)
      }

      reader.readAsText(file)
    }

    input.click()
  }

  const handleOpenFile = () => {
    if (!contextMenu) return
    handleFileClick(contextMenu.item.path)
    setContextMenu(null)
  }

  const handleExportFile = (format: "json" | "js") => {
    if (!contextMenu || !exportFile) return

    // Call the exportFile function
    exportFile(format)
    setContextMenu(null)
  }

  const handleImportAgent = () => {
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
          const agentData = JSON.parse(content)

          // Validate that this is an agent JSON
          if (!agentData.name || !agentData.description) {
            throw new Error("Invalid agent JSON format")
          }

          // Create a JS file with the agent data
          const jsContent = `// Mistalic AI Agent Code
// Version: 0.01.0001-beta
// Creator: lotus

// Define your AI agent below
const agent = ${JSON.stringify(agentData, null, 2)};

// Export the agent configuration
export default agent;`

          createNewFile(`${agentData.name.replace(/\s+/g, "_")}.js`, jsContent, "javascript")
        } catch (error) {
          alert("Error importing agent: " + (error as Error).message)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  return (
    <div className="w-64 h-full bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
      <div className="flex border-b border-[#3c3c3c]">
        <button
          className={`flex-1 p-2 text-center ${activeTab === "explorer" ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("explorer")}
        >
          <FileCode size={16} className="mx-auto" />
        </button>
        <button
          className={`flex-1 p-2 text-center ${activeTab === "search" ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("search")}
        >
          <Search size={16} className="mx-auto" />
        </button>
        <button
          className={`flex-1 p-2 text-center ${activeTab === "settings" ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("settings")}
        >
          <SettingsIcon size={16} className="mx-auto" />
        </button>
      </div>

      {activeTab === "explorer" && (
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <div className="flex justify-between items-center p-1 text-xs font-semibold uppercase text-gray-400">
              <button
                className="flex items-center"
                onClick={() => setExpandedSections({ ...expandedSections, files: !expandedSections.files })}
              >
                {expandedSections.files ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Files
              </button>
              <div className="flex">
                <button className="hover:bg-[#3c3c3c] p-1 rounded mr-1" onClick={handleImportFile} title="Import File">
                  <Upload size={14} />
                </button>
                <button
                  className="hover:bg-[#3c3c3c] p-1 rounded"
                  onClick={() => setShowNewFileInput(true)}
                  title="New File"
                >
                  <FilePlus size={14} />
                </button>
              </div>
            </div>

            {showNewFileInput && (
              <div className="px-4 py-1">
                <input
                  ref={newFileInputRef}
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newFileName.trim()) {
                      setShowNewFileInput(false)
                    }
                  }}
                  placeholder="filename.js"
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {expandedSections.files && (
              <div className="pl-4">
                {files.map((file) => (
                  <div key={file.path} className="group">
                    {renamingItem && renamingItem.path === file.path ? (
                      <div className="px-2 py-1">
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renamingItem.name}
                          onChange={(e) => setRenamingItem({ ...renamingItem, name: e.target.value })}
                          onKeyDown={handleRenameKeyDown}
                          onBlur={() => setRenamingItem(null)}
                          className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer group"
                        onClick={() => handleFileClick(file.path)}
                        onContextMenu={(e) => handleContextMenu(e, file, "file")}
                        onDoubleClick={() => handleFileClick(file.path)}
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] p-0.5 rounded"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleContextMenu(e, file, "file")
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center p-1 mt-2 text-xs font-semibold uppercase text-gray-400">
              <button
                className="flex items-center"
                onClick={() => setExpandedSections({ ...expandedSections, agents: !expandedSections.agents })}
              >
                {expandedSections.agents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Agents
              </button>
              <div className="flex">
                <button
                  className="hover:bg-[#3c3c3c] p-1 rounded mr-1"
                  onClick={handleImportAgent}
                  title="Import Agent"
                >
                  <Upload size={14} />
                </button>
                <Link href="/agents/create">
                  <button className="hover:bg-[#3c3c3c] p-1 rounded" title="New Agent">
                    <FilePlus size={14} />
                  </button>
                </Link>
              </div>
            </div>

            {expandedSections.agents && (
              <div className="pl-4">
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer group"
                      onClick={() => handleAgentClick(agent)}
                      onContextMenu={(e) => handleContextMenu(e, agent, "agent")}
                    >
                      <span className="text-sm truncate">{agent.name}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] p-0.5 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContextMenu(e, agent, "agent")
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs p-2">No agents created yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
            />

            {searchResults.length > 0 ? (
              <div>
                {searchResults.map((result, index) => (
                  <div key={index} className="mb-2">
                    <div
                      className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer text-blue-400"
                      onClick={() => handleSearchResultClick(result)}
                      onDoubleClick={() => handleSearchResultClick(result)}
                    >
                      {result.type === "file" ? (
                        <FileCode size={14} className="mr-2" />
                      ) : (
                        <Users size={14} className="mr-2" />
                      )}
                      <span className="text-sm truncate">{result.name}</span>
                    </div>

                    {result.matches && result.matches.length > 0 && (
                      <div className="pl-6 text-xs">
                        {result.matches.map((match: any, mIndex: number) => (
                          <div
                            key={mIndex}
                            className="py-1 hover:bg-[#2a2d2e] rounded cursor-pointer"
                            onClick={() => handleSearchResultClick(result)}
                            onDoubleClick={() => handleSearchResultClick(result)}
                          >
                            <div className="flex">
                              <span className="text-gray-500 mr-2">Line {match.line}:</span>
                              <span className="truncate">{match.preview}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-gray-400 text-sm p-2">No results found</div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <div className="text-xs font-semibold uppercase text-gray-400 p-1 mb-2">Settings</div>

            <Link href="/settings/api-keys" className="flex items-center px-3 py-2 hover:bg-[#2a2d2e] rounded">
              <SettingsIcon size={14} className="mr-2" />
              <span className="text-sm">API Keys</span>
            </Link>

            <Link href="/settings/editor" className="flex items-center px-3 py-2 hover:bg-[#2a2d2e] rounded">
              <FileCode size={14} className="mr-2" />
              <span className="text-sm">Editor Settings</span>
            </Link>

            <Link href="/settings/theme" className="flex items-center px-3 py-2 hover:bg-[#2a2d2e] rounded">
              <Code size={14} className="mr-2" />
              <span className="text-sm">Theme</span>
            </Link>

            <div className="text-xs font-semibold uppercase text-gray-400 p-1 mt-4 mb-2">Terminal</div>

            <button className="flex items-center px-3 py-2 hover:bg-[#2a2d2e] rounded w-full text-left">
              <TerminalIcon size={14} className="mr-2" />
              <span className="text-sm">Terminal Settings</span>
            </button>
          </div>
        </div>
      )}

      {contextMenu && contextMenu.visible && (
        <div
          className="fixed bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {contextMenu.type === "file" && (
              <>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left"
                  onClick={handleOpenFile}
                >
                  <FileCode size={14} className="mr-2" />
                  <span>Open</span>
                </button>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left"
                  onClick={handleRename}
                >
                  <Edit size={14} className="mr-2" />
                  <span>Rename</span>
                </button>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left"
                  onClick={() => handleExportFile(contextMenu.item.name.endsWith(".json") ? "json" : "js")}
                >
                  <Download size={14} className="mr-2" />
                  <span>Export</span>
                </button>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left text-red-400"
                  onClick={handleDelete}
                >
                  <Trash size={14} className="mr-2" />
                  <span>Delete</span>
                </button>
              </>
            )}

            {contextMenu.type === "agent" && (
              <>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left"
                  onClick={() => handleAgentClick(contextMenu.item)}
                >
                  <FileCode size={14} className="mr-2" />
                  <span>Open</span>
                </button>
                <button className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left" onClick={handleRun}>
                  <Play size={14} className="mr-2" />
                  <span>Run Agent</span>
                </button>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left"
                  onClick={handleRename}
                >
                  <Edit size={14} className="mr-2" />
                  <span>Rename</span>
                </button>
                <button
                  className="flex items-center px-4 py-1 hover:bg-[#2a2d2e] w-full text-left text-red-400"
                  onClick={handleDelete}
                >
                  <Trash size={14} className="mr-2" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

