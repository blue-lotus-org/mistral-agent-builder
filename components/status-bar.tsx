"use client"

import { useEffect, useState } from "react"
import type { FileInfo } from "./editor"

interface StatusBarProps {
  currentFile?: FileInfo
}

export default function StatusBar({ currentFile }: StatusBarProps) {
  const [position, setPosition] = useState({ line: 1, column: 1 })

  useEffect(() => {
    // In a full implementation, this would listen to cursor position changes in Monaco
    // For now, we're just displaying a default position
  }, [])

  return (
    <div className="bg-[#007acc] text-white px-4 py-0.5 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <span>Mistalic v0.01.0001-beta</span>
        <span>{currentFile?.language || "JavaScript"}</span>
        <span>UTF-8</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>
          Ln {position.line}, Col {position.column}
        </span>
        <span>Spaces: 2</span>
        <span>Creator: lotus</span>
      </div>
    </div>
  )
}

