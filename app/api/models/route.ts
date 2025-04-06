import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, this would fetch from the Mistral API
    // For demo purposes, we're returning mock data
    return NextResponse.json({
      models: [
        {
          id: "mistral-small-latest",
          name: "Mistral Small",
          description: "Fast and efficient model for general tasks",
          free: true,
        },
        {
          id: "mistral-large-latest",
          name: "Mistral Large",
          description: "Balance & multi-purpose",
          free: true,
        },
        {
          id: "gemini-2.0-flash",
          name: "Gemini 2",
          description: "Balanced model for more complex tasks",
          free: false,
        },
        {
          id: "gemini-2.0-flash-exp",
          name: "Gemini 2 EXP",
          description: "Balanced model for more complex tasks - experimental",
          free: false,
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

