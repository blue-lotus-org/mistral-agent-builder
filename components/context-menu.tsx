"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  items: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
    danger?: boolean
  }[]
}

export default function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Adjust position if menu would go off screen
  const adjustedX = x + 200 > window.innerWidth ? x - 200 : x
  const adjustedY = y + items.length * 36 > window.innerHeight ? y - items.length * 36 : y

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg w-48"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <ul className="py-1">
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => {
                item.onClick()
                onClose()
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-[#37373d] ${
                item.danger ? "text-red-400 hover:text-red-300" : "text-gray-300"
              }`}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

