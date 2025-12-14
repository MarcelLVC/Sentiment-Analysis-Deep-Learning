"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Brain, Star, TrendingUp, TrendingDown, Sparkles } from "lucide-react"

export default function HomePage() {
  const [review, setReview] = useState("")
  const [prediction, setPrediction] = useState<{
    sentiment: "positive" | "negative" | "neutral"
    confidence: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const aboutRef = useRef<HTMLElement>(null)

  const handlePredict = async () => {
    if (!review.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      })
      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SentiHotel</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={scrollToAbout} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              About
            </button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Try Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">AI-Powered Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance animate-fade-in-up text-gray-900">
            Hotel Review Sentiment Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-pretty animate-fade-in-up animation-delay-200">
            Analyze hotel reviews instantly with our advanced LSTM neural network model
          </p>

          {/* Prediction Card */}
          <Card className="p-8 bg-white border-gray-200 shadow-lg animate-fade-in-up animation-delay-400">
            <Textarea
              placeholder="Enter a hotel review to analyze..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-32 mb-6 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            />
            <Button
              onClick={handlePredict}
              disabled={isLoading || !review.trim()}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 font-semibold text-white"
            >
              {isLoading ? "Analyzing..." : "Analyze Sentiment"}
            </Button>

            {prediction && (
              <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-gray-50 border border-blue-200 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-600 font-medium">Sentiment:</span>
                  <div className="flex items-center gap-2">
                    {prediction.sentiment === "positive" ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-bold capitalize text-lg">{prediction.sentiment}</span>
                      </>
                    ) : prediction.sentiment === "negative" ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-bold capitalize text-lg">{prediction.sentiment}</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-600 font-bold capitalize text-lg">{prediction.sentiment}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Confidence:</span>
                    <span className="text-blue-600 font-bold text-lg">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-fill-bar rounded-full"
                      style={
                        {
                          "--fill-percentage": `${prediction.confidence * 100}%`,
                          width: `${prediction.confidence * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">About Our Model</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 bg-white border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">LSTM Neural Network</h3>
              <p className="text-gray-600 leading-relaxed">
                Our model uses Long Short-Term Memory (LSTM) architecture, a specialized type of recurrent neural
                network designed to learn from sequential data. It excels at understanding context and sentiment in text
                by remembering important information throughout the review.
              </p>
            </Card>

            <Card className="p-8 bg-white border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">High Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Trained on thousands of hotel reviews, our model achieves high accuracy in detecting positive, negative,
                and neutral sentiments. It understands nuanced language patterns and can identify subtle emotional cues
                in customer feedback.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8 text-gray-900">Benefits of Sentiment Analysis</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Customer Insights",
                  description: "Understand customer opinions and satisfaction levels automatically",
                },
                {
                  title: "Real-time Monitoring",
                  description: "Track reputation and respond quickly to negative feedback",
                },
                {
                  title: "Data-Driven Decisions",
                  description: "Make informed business decisions based on sentiment trends",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <h4 className="text-xl font-semibold mb-3 text-blue-600">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SentiHotel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
