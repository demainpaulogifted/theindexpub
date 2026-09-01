"use client"

import { useEffect } from "react"

function getVisitorId() {
  if (typeof window === "undefined") return "anonymous"

  try {
    const key = "theindex_visitor_id"
    let id = localStorage.getItem(key)

    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_\( {Date.now()}_ \){Math.random().toString(36).slice(2, 11)}`
      localStorage.setItem(key, id)
    }

    return id
  } catch {
    return "anonymous"
  }
}

export default function ViewTracker({ articleId }) {
  useEffect(() => {
    if (!articleId) return

    let cancelled = false

    async function trackView() {
      try {
        if (cancelled) return

        const visitorId = getVisitorId()
        const referrer =
          typeof document !== "undefined" ? document.referrer || null : null

        await fetch("/api/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId,
            visitorId,
            referrer,
          }),
          keepalive: true,
        })
      } catch (error) {
        console.error("View tracking failed:", error)
      }
    }

    const timer = setTimeout(trackView, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [articleId])

  return null
}