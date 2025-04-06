import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for agents (in a real app, this would be a database)
let agents = [
  {
    id: "agent_123456789",
    name: "Code Assistant",
    description: "Helps with coding tasks and debugging",
    model: "mistral-small-latest",
    created: "2023-11-01T12:00:00Z",
  },
  {
    id: "agent_987654321",
    name: "Documentation Helper",
    description: "Generates documentation for code",
    model: "mistral-small-latest",
    created: "2023-11-02T14:30:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      agents: agents,
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, model = "mistral-small-latest" } = await req.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Generate a unique ID
    const agentId = `agent_${Date.now()}`

    // Create new agent
    const newAgent = {
      id: agentId,
      name,
      description,
      model,
      created: new Date().toISOString(),
    }

    // Add to our in-memory storage
    agents.push(newAgent)

    return NextResponse.json({
      success: true,
      agent: newAgent,
    })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}

// Add a PUT endpoint to update agents
export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, model } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
    }

    // Find the agent
    const agentIndex = agents.findIndex((a) => a.id === id)
    if (agentIndex === -1) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Update the agent
    const updatedAgent = {
      ...agents[agentIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(model && { model }),
    }

    agents[agentIndex] = updatedAgent

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
    })
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

// Add a DELETE endpoint to delete agents
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
    }

    // Find and remove the agent
    const initialLength = agents.length
    agents = agents.filter((a) => a.id !== id)

    if (agents.length === initialLength) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting agent:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}

