"use client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300">
      <header className="bg-[#252526] border-b border-[#3c3c3c] h-10 flex items-center px-4">
        <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to IDE
        </Link>
        <div className="text-blue-400 font-semibold">Mistalic - Settings</div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>

          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link href="/settings/api-keys" className="p-4 border border-[#3c3c3c] rounded-lg hover:bg-[#37373d]">
                <h2 className="text-lg font-medium mb-2">API Keys</h2>
                <p className="text-sm text-gray-400">Configure your Mistral API keys</p>
              </Link>

              <Link href="/settings/editor" className="p-4 border border-[#3c3c3c] rounded-lg hover:bg-[#37373d]">
                <h2 className="text-lg font-medium mb-2">Editor Settings</h2>
                <p className="text-sm text-gray-400">Customize your editor experience</p>
              </Link>

              <Link href="/settings/theme" className="p-4 border border-[#3c3c3c] rounded-lg hover:bg-[#37373d]">
                <h2 className="text-lg font-medium mb-2">Theme</h2>
                <p className="text-sm text-gray-400">Change the appearance of the IDE</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

