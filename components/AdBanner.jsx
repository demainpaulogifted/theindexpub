"use client"

import { useEffect, useRef } from "react"
import { trackAdView, trackAdClick } from "../lib/ads"

export default function AdBanner({ ad, className = "" }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!ad?.id || tracked.current) return
    tracked.current = true
    trackAdView(ad.id)
  }, [ad?.id])

  if (!ad || !ad.image_url) return null

  const title = ad.name || ad.title || "Advertisement"
  const href = ad.target_url || "#"

  async function handleClick() {
    await trackAdClick(ad.id)
  }

  return (
    <div
      className={`ad-banner ${className}`}
      style={{
        margin: "28px 0",
        border: "1px solid #e5e5e5",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#fafafa",
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <img
          src={ad.image_url}
          alt={ad.alt_text || title}
          style={{
            width: "100%",
            maxHeight: "320px",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div style={{ padding: "14px 16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#888",
              marginBottom: "6px",
            }}
          >
            Advertisement
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {title}
          </div>

          {ad.description && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                color: "#555",
                lineHeight: 1.45,
              }}
            >
              {ad.description}
            </p>
          )}
        </div>
      </a>
    </div>
  )
}