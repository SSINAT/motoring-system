"use client"

import { useEffect, useRef } from "react"

interface MetricsChartProps {
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Mock chart data - in a real app, you'd use Chart.js or similar
    const data = [
      { label: "CPU", value: metrics.cpu, color: "#3b82f6" },
      { label: "Memory", value: metrics.memory, color: "#10b981" },
      { label: "Disk", value: metrics.disk, color: "#f59e0b" },
      { label: "Network", value: metrics.network, color: "#8b5cf6" },
    ]

    // Simple bar chart
    const barWidth = 60
    const barSpacing = 20
    const startX = 50
    const maxHeight = 200

    data.forEach((item, index) => {
      const x = startX + index * (barWidth + barSpacing)
      const height = (item.value / 100) * maxHeight
      const y = canvas.height - height - 50

      // Draw bar
      ctx.fillStyle = item.color
      ctx.fillRect(x, y, barWidth, height)

      // Draw label
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.label, x + barWidth / 2, canvas.height - 30)
      ctx.fillText(`${item.value}%`, x + barWidth / 2, y - 10)
    })
  }, [metrics])

  return (
    <div className="w-full h-64">
      <canvas ref={canvasRef} width={400} height={250} className="w-full h-full" />
    </div>
  )
}
