import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { review } = await request.json()

    if (!review || typeof review !== "string") {
      return NextResponse.json({ error: "Invalid review text" }, { status: 400 })
    }

    // Connect to the Python Backend
    const pythonApiUrl = "http://127.0.0.1:5000/predict"

    const response = await fetch(pythonApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review }),
    })

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      sentiment: data.sentiment,
      confidence: data.confidence,
    })

  } catch (error) {
    console.error("[Prediction API error]:", error)
    return NextResponse.json(
      { error: "Failed to connect to sentiment analysis model" },
      { status: 500 }
    )
  }
}