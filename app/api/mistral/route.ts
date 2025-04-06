import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { mistral } from "@ai-sdk/mistral"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "mistral-small-latest", systemPrompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use the AI SDK to generate text with Mistral model
    const { text } = await generateText({
      model: mistral(model),
      prompt,
      system: systemPrompt || "You are a helpful AI assistant that specializes in coding and software development.",
      temperature: 0.7,
      maxTokens: 2048,
    })

    return NextResponse.json({ success: true, text })
  } catch (error: any) {
    console.error("Mistral API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate text from Mistral API",
      },
      { status: 500 },
    )
  }
}

