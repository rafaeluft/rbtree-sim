"use client"

import { RedBlackTreeVisualizer, RedBlackTreeVisualizerHandle } from "@/components/red-black-tree-visualizer"
import { Footer } from "@/components/footer"
import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { extractSearchParams } from "@/lib/extractSearchParams"

export default function Home() {
  const ref = useRef<RedBlackTreeVisualizerHandle>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!ref.current) return

    const v = searchParams.get("v") ?? searchParams.get("values")
    if (!v) return

    let numbers = extractSearchParams(v, searchParams);
    if (numbers.length > 0) {
      ref.current.setInputValues(numbers)
    }
  }, [searchParams])

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <RedBlackTreeVisualizer ref={ref} />
      </div>
      <Footer />
    </main>
  )
}