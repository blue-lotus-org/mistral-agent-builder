"use client"

import { useState, useEffect } from "react"
import Editor, { type FileInfo } from "@/components/editor"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import StatusBar from "@/components/status-bar"
import Terminal from "@/components/terminal"

const DEFAULT_FILE: FileInfo = {
  name: "agent.js",
  path: "/agent.js",
  content: `// Mistalic AI Agent Code
// Version: 0.01.0001-beta
// Creator: lotus

// Define your AI agent below
const agent = {
  name: "CodeAssistant",
  description: "An AI assistant that helps with coding tasks",
  models: ["mistral-small-latest"],
  functions: [
    {
      name: "generateCode",
      description: "Generate code based on a description",
      parameters: {
        type: "object",
        properties: {
          language: {
            type: "string",
            description: "Programming language to generate code in"
          },
          description: {
            type: "string",
            description: "Description of what the code should do"
          }
        },
        required: ["language", "description"]
      }
    }
  ]
};

// Export the agent configuration
export default agent;`,
  language: "javascript",
}

interface Agent {
  id: string
  name: string
  description: string
  model: string
  created: string
  [key: string]: any
}

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([DEFAULT_FILE])
  const [currentFile, setCurrentFile] = useState<FileInfo>(DEFAULT_FILE)
  const [agents, setAgents] = useState<Agent[]>([])

  // Load files from localStorage on initial load
  useEffect(() => {
    const savedFiles = localStorage.getItem("mistalic-files")
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles) as FileInfo[]
        if (parsedFiles.length > 0) {
          setFiles(parsedFiles)
          setCurrentFile(parsedFiles[0])
        }
      } catch (error) {
        console.error("Error loading saved files:", error)
      }
    } else {
      // Initialize with default file
      localStorage.setItem("mistalic-files", JSON.stringify([DEFAULT_FILE]))
    }

    // Load agents
    fetchAgents()

    // Apply theme from localStorage
    applyThemeFromStorage()
  }, [])

  const applyThemeFromStorage = () => {
    const savedTheme = localStorage.getItem("mistalic-theme")
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        document.documentElement.setAttribute("data-theme", theme.name)
        document.documentElement.style.setProperty("--accent-color", theme.accentColor)
      } catch (error) {
        console.error("Error applying theme:", error)
      }
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      const data = await response.json()
      if (data.agents) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  const createNewFile = (fileName: string, content = "", language?: string) => {
    if (!fileName) return

    // Check if file already exists
    if (files.some((file) => file.name === fileName)) {
      alert(`File ${fileName} already exists`)
      return
    }

    const path = `/${fileName}`

    // Detect language based on file extension if not provided
    if (!language) {
      const extension = fileName.split(".").pop()?.toLowerCase()
      language = "javascript"

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
        case "py":
          language = "python"
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
        case "md":
          language = "markdown"
          break
      }
    }

    const newFile: FileInfo = {
      name: fileName,
      path,
      content,
      language,
    }

    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    setCurrentFile(newFile)

    // Store in localStorage
    localStorage.setItem("mistalic-files", JSON.stringify(updatedFiles))
  }

  const openFile = (path: string) => {
    const file = files.find((f) => f.path === path)
    if (file) {
      setCurrentFile(file)
    }
  }

  const updateFileContent = (content: string) => {
    const updatedFile = { ...currentFile, content }
    const updatedFiles = files.map((file) => (file.path === currentFile.path ? updatedFile : file))

    setCurrentFile(updatedFile)
    setFiles(updatedFiles)

    // Store in localStorage
    localStorage.setItem("mistalic-files", JSON.stringify(updatedFiles))

    // If this is an agent file, try to update the agent data
    if (currentFile.name.endsWith(".js")) {
      try {
        // Extract agent data from JS file
        const agentMatch = content.match(/const\s+agent\s*=\s*({[\s\S]*?});/)
        if (agentMatch && agentMatch[1]) {
          // This is a simplified approach - in a real app you'd use a proper JS parser
          const agentObj = new Function(`return ${agentMatch[1]}`)()

          // Check if this is an agent file with required properties
          if (agentObj.name && agentObj.description) {
            // Update agent in the database or local storage
            // This would normally be an API call
            console.log("Agent data updated:", agentObj)
          }
        }
      } catch (error) {
        console.error("Error parsing agent data:", error)
      }
    }
  }

  const saveFile = async () => {
    // In a real app, this would save to a backend or file system
    // For now, we'll just save to localStorage
    localStorage.setItem("mistalic-files", JSON.stringify(files))

    // If this is a JS file, handle special saving logic
    if (currentFile.name.endsWith(".js")) {
      try {
        // Extract agent data if this is an agent file
        const agentMatch = currentFile.content.match(/const\s+agent\s*=\s*({[\s\S]*?});/)
        if (agentMatch && agentMatch[1]) {
          const agentObj = new Function(`return ${agentMatch[1]}`)()

          // Check if this is an agent file with required properties
          if (agentObj.name && agentObj.description) {
            console.log("Agent saved:", agentObj)
            // In a real app, you would update the agent in the database
          }
        }
      } catch (error) {
        console.error("Error saving JS file:", error)
        // Continue anyway - don't block the save
      }
    }

    return true
  }

  const renameFile = (oldPath: string, newName: string) => {
    const fileIndex = files.findIndex((f) => f.path === oldPath)
    if (fileIndex === -1) return

    const file = files[fileIndex]
    const newPath = `/${newName}`

    // Check if file with new name already exists
    if (files.some((f) => f.path === newPath && f.path !== oldPath)) {
      alert(`File ${newName} already exists`)
      return
    }

    const updatedFile = {
      ...file,
      name: newName,
      path: newPath,
    }

    const updatedFiles = [...files]
    updatedFiles[fileIndex] = updatedFile

    setFiles(updatedFiles)
    if (currentFile.path === oldPath) {
      setCurrentFile(updatedFile)
    }

    // Store in localStorage
    localStorage.setItem("mistalic-files", JSON.stringify(updatedFiles))
  }

  const deleteFile = (path: string) => {
    const updatedFiles = files.filter((f) => f.path !== path)

    setFiles(updatedFiles)

    // If current file is deleted, set first file as current
    if (currentFile.path === path && updatedFiles.length > 0) {
      setCurrentFile(updatedFiles[0])
    }

    // Store in localStorage
    localStorage.setItem("mistalic-files", JSON.stringify(updatedFiles))
  }

  const exportFile = (format: "json" | "js") => {
    // This function is now handled directly in the header component
    console.log("Export function called with format:", format)
    // We'll keep this as a fallback, but it shouldn't be used anymore

    if (!currentFile) return

    let content = currentFile.content
    let fileName = currentFile.name

    if (format === "json") {
      try {
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
      } catch (error) {
        console.error("Error converting to JSON:", error)
        alert(`Could not convert to JSON: ${(error as Error).message}`)
        return
      }
    } else if (format === "js" && fileName.endsWith(".json")) {
      try {
        // Try to convert JSON to JavaScript
        const jsonData = JSON.parse(content)
        content = `// Mistalic AI Agent Code
// Version: 0.01.0001-beta
// Creator: lotus

// Define your AI agent below
const agent = ${JSON.stringify(jsonData, null, 2)};

// Export the agent configuration
export default agent;`
        fileName = fileName.replace(/\.json$/, ".js")
      } catch (error) {
        console.error("Error converting to JS:", error)
        alert(`Could not convert to JS: ${(error as Error).message}`)
        return
      }
    }

    // Create a blob and download it
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/javascript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (fileName: string, content: string) => {
    // Special handling for JSON imports
    if (fileName.endsWith(".json")) {
      try {
        // Try to clean the content before parsing
        let cleanedContent = content.trim()

        // Check if the content might be a JavaScript object instead of JSON
        if (
          cleanedContent.includes("//") ||
          cleanedContent.startsWith("const ") ||
          cleanedContent.startsWith("let ") ||
          cleanedContent.startsWith("var ")
        ) {
          // Try to extract JSON from JavaScript
          const match =
            cleanedContent.match(/const\s+\w+\s*=\s*({[\s\S]*?});/) ||
            cleanedContent.match(/let\s+\w+\s*=\s*({[\s\S]*?});/) ||
            cleanedContent.match(/var\s+\w+\s*=\s*({[\s\S]*?});/) ||
            cleanedContent.match(/=\s*({[\s\S]*?});/)

          if (match && match[1]) {
            try {
              // Try to evaluate the object
              const obj = new Function(`return ${match[1]}`)()
              cleanedContent = JSON.stringify(obj, null, 2)
            } catch (evalError) {
              console.error("Error evaluating JS object:", evalError)
              throw new Error("The file contains JavaScript, not valid JSON. Please use a proper JSON file.")
            }
          } else {
            throw new Error("Could not extract valid JSON from the JavaScript file.")
          }
        }

        // Validate JSON
        JSON.parse(cleanedContent)

        // Create the file with cleaned JSON content
        createNewFile(fileName, cleanedContent, "json")
      } catch (error) {
        console.error("Error importing JSON:", error)
        alert(`Invalid JSON file: ${error.message || "Please check the file format."}`)
      }
    } else {
      // Regular file import
      createNewFile(fileName, content)
    }
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Header onSave={saveFile} onExport={exportFile} onImport={handleImport} currentFile={currentFile} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          createNewFile={createNewFile}
          openFile={openFile}
          renameFile={renameFile}
          deleteFile={deleteFile}
          exportFile={exportFile}
          files={files}
          agents={agents}
        />
        <div className="flex flex-col flex-1">
          <Editor
            currentFile={currentFile}
            onFileChange={updateFileContent}
            files={files}
            openFile={openFile}
            saveFile={saveFile}
          />
          <Terminal />
        </div>
      </div>
      <StatusBar currentFile={currentFile} />
    </main>
  )
}

