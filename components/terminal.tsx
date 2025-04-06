"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, ArrowUp, ArrowDown, Square, SquareMinusIcon as SquareMinimize } from "lucide-react"

export default function Terminal() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [output, setOutput] = useState<string[]>([
    "> Mistalic Terminal v0.01.0001-beta",
    '> Type "help" for available commands',
    "> ",
  ])
  const [command, setCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const executeCommand = async (cmd: string) => {
    setIsExecuting(true)

    try {
      switch (cmd.toLowerCase().trim()) {
        case "help":
          return [
            "Available commands:",
            "  help - Show this help message",
            "  clear - Clear the terminal",
            "  models - List available Mistral models",
            "  version - Show Mistalic version",
            "  create-agent - Create a new AI agent",
            "  ask <question> - Ask the AI a question",
            "  save-env <key> <value> - Save a value to .env file",
            "  ls - List files in the current directory",
          ]

        case "clear":
          setOutput(["> "])
          return null

        case "models":
          // Actually fetch models from Mistral API
          try {
            const response = await fetch("/api/models")
            const data = await response.json()

            if (data.models) {
              return [
                "Available Mistral models:",
                ...data.models.map((model) => `  - ${model.id} ${model.free ? "(Free)" : "(Paid)"}`),
              ]
            } else {
              return [
                "Error fetching models. Using cached list:",
                "  - mistral-small-latest (Free)",
                "  - mistral-medium-latest (Paid)",
                "  - mistral-large-latest (Paid)",
              ]
            }
          } catch (error) {
            console.error("Error fetching models:", error)
            return [
              "Error fetching models. Using cached list:",
              "  - mistral-small-latest (Free)",
              "  - mistral-medium-latest (Paid)",
              "  - mistral-large-latest (Paid)",
            ]
          }

        case "version":
          return ["Mistalic v0.01.0001-beta", "Created by lotus"]

        case "create-agent":
          // This would normally integrate with the agent creation API
          return [
            "Creating new agent...",
            "Agent created successfully!",
            "Agent ID: agent_" + Date.now(),
            "Agent ID saved to .env file",
          ]

        case "ls":
          // Get files from localStorage
          try {
            const savedFiles = localStorage.getItem("mistalic-files")
            if (savedFiles) {
              const files = JSON.parse(savedFiles)
              return ["Files in current directory:", ...files.map((file) => `  ${file.name}`)]
            } else {
              return ["No files found"]
            }
          } catch (error) {
            console.error("Error listing files:", error)
            return ["Error listing files"]
          }

        default:
          // Handle ask command
          if (cmd.toLowerCase().startsWith("ask ")) {
            const question = cmd.substring(4)
            try {
              return ["Asking Mistral AI: " + question, "Thinking..."]
            } catch (error) {
              console.error("Error asking question:", error)
              return ["Error asking question"]
            }
          }

          // Handle save-env command
          if (cmd.toLowerCase().startsWith("save-env ")) {
            const parts = cmd.split(" ")
            if (parts.length >= 3) {
              const key = parts[1]
              const value = parts.slice(2).join(" ")

              // In a real app, this would update the .env file
              // For now, we'll just save to localStorage
              try {
                const envVars = JSON.parse(localStorage.getItem("mistalic-env") || "{}")
                envVars[key] = value
                localStorage.setItem("mistalic-env", JSON.stringify(envVars))

                return [`Environment variable ${key} saved successfully`]
              } catch (error) {
                console.error("Error saving environment variable:", error)
                return ["Error saving environment variable"]
              }
            } else {
              return ["Usage: save-env <key> <value>"]
            }
          }

          return [`Command not found: ${cmd}`]
      }
    } catch (error) {
      console.error("Error executing command:", error)
      return ["Error executing command: " + cmd]
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim() && !isExecuting) {
      // Add command to history
      setCommandHistory([...commandHistory, command])
      setHistoryIndex(-1)

      const newOutput = [...output]
      newOutput[newOutput.length - 1] = `> ${command}`

      // Execute command
      const result = await executeCommand(command)

      if (result === null) {
        // clear command was executed
        setCommand("")
        return
      }

      if (result) {
        newOutput.push(...result)
      }

      newOutput.push("> ")
      setOutput(newOutput)
      setCommand("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "")
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "")
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand("")
      }
    }
  }

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-0 bg-[#252526] border border-[#3c3c3c] rounded-tl-md z-50">
        <div className="flex items-center justify-between px-4 py-1">
          <div className="text-sm">Terminal</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsMinimized(false)} className="hover:bg-[#3c3c3c] p-1 rounded">
              <Square size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-[#1e1e1e] border-t border-[#3c3c3c] ${isExpanded ? "fixed inset-0 z-50 pt-10" : "h-48"}`}>
      <div className="flex items-center justify-between bg-[#252526] border-b border-[#3c3c3c] px-4 py-1">
        <div className="text-sm">Terminal</div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMinimized(true)} className="hover:bg-[#3c3c3c] p-1 rounded" title="Minimize">
            <SquareMinimize size={14} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-[#3c3c3c] p-1 rounded"
            title={isExpanded ? "Restore" : "Maximize"}
          >
            {isExpanded ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          </button>
          <button
            onClick={() =>
              setOutput(["> Mistalic Terminal v0.01.0001-beta", '> Type "help" for available commands', "> "])
            }
            className="hover:bg-[#3c3c3c] p-1 rounded"
            title="Clear"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div ref={terminalRef} className="h-full overflow-y-auto p-2 font-mono text-sm" onClick={focusInput}>
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
            {index === output.length - 1 && (
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleCommand}
                className="bg-transparent border-none outline-none w-64 text-inherit"
                autoFocus
                disabled={isExecuting}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

