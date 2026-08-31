"use client"

import { useEffect } from "react"

export default function ViewTracker({
  articleId,
}) {
  useEffect(() => {
    if (!articleId) return

    let cancelled = false

    async function trackView() {
      try {
        if (cancelled) return

        await fetch("/api/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId,
          }),
          keepalive: true,
        })
      } catch (error) {
        console.error(
          "View tracking failed:",
          error
        )
      }
    }

    trackView()

    return () => {
      cancelled = true
    }
  }, [articleId])

  return null
}