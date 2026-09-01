"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function getVisitorId() {
  if (typeof window === "undefined") return "anonymous"

  try {
    const key = "theindex_visitor_id"
    let id = localStorage.getItem(key)

    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11)
      localStorage.setItem(key, id)
    }

    return id
  } catch {
    return "anonymous"
  }
}

function getArticleUrl(slug) {
  if (typeof window === "undefined") return ""
  return window.location.origin + "/article/" + slug
}

export default function ArticleActions({
  articleId,
  title,
  slug,
  excerpt = "",
}) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loadingLike, setLoadingLike] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)
  const [openMore, setOpenMore] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!articleId) return

    async function loadLikes() {
      try {
        const visitorId = getVisitorId()

        const { count, error: countError } = await supabase
          .from("article_likes")
          .select("*", { count: "exact", head: true })
          .eq("article_id", articleId)

        if (!countError) {
          setLikeCount(count || 0)
        }

        if (visitorId && visitorId !== "anonymous") {
          const { data, error } = await supabase
            .from("article_likes")
            .select("id")
            .eq("article_id", articleId)
            .eq("visitor_id", visitorId)
            .maybeSingle()

          if (!error && data) {
            setLiked(true)
          }
        }
      } catch (err) {
        console.error("Load likes error:", err)
      }
    }

    loadLikes()
  }, [articleId])

  async function toggleLike() {
    if (!articleId || loadingLike) return

    const visitorId = getVisitorId()
    if (!visitorId || visitorId === "anonymous") {
      alert("Unable to register like in this browser.")
      return
    }

    setLoadingLike(true)

    try {
      if (liked) {
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", articleId)
          .eq("visitor_id", visitorId)

        if (error) throw error

        setLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      } else {
        const { error } = await supabase.from("article_likes").insert({
          article_id: articleId,
          visitor_id: visitorId,
        })

        if (error) {
          if (error.code === "23505") {
            setLiked(true)
          } else {
            throw error
          }
        } else {
          setLiked(true)
          setLikeCount((c) => c + 1)
        }
      }
    } catch (err) {
      console.error("Like error:", err)
      alert("Could not update like. Please try again.")
    } finally {
      setLoadingLike(false)
    }
  }

  async function copyLink() {
    const url = getArticleUrl(slug)
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareUrl = ready ? getArticleUrl(slug) : ""
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title || "")
  const textForShare = excerpt
    ? (title || "") + " — " + excerpt
    : title || ""
  const encodedText = encodeURIComponent(textForShare)

  const primaryShares = [
    {
      name: "X",
      label: "Share on X",
      href: shareUrl
        ? "https://twitter.com/intent/tweet?url=" + encodedUrl + "&text=" + encodedTitle
        : "#",
      color: "#000",
    },
    {
      name: "Facebook",
      label: "Share on Facebook",
      href: shareUrl
        ? "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl
        : "#",
      color: "#1877F2",
    },
    {
      name: "WhatsApp",
      label: "Share on WhatsApp",
      href: shareUrl
        ? "https://api.whatsapp.com/send?text=" + encodedText + "%20" + encodedUrl
        : "#",
      color: "#25D366",
    },
  ]

  const moreShares = [
    {
      name: "LinkedIn",
      label: "Share on LinkedIn",
      href: shareUrl
        ? "https://www.linkedin.com/sharing/share-offsite/?url=" + encodedUrl
        : "#",
      color: "#0A66C2",
    },
    {
      name: "Telegram",
      label: "Share on Telegram",
      href: shareUrl
        ? "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedTitle
        : "#",
      color: "#0088cc",
    },
    {
      name: "Email",
      label: "Share by Email",
      href: shareUrl
        ? "mailto:?subject=" + encodedTitle + "&body=" + encodedText + "%20" + encodedUrl
        : "#",
      color: "#555",
    },
  ]

  return (
    <div className="article-actions">
      <div className="article-actions-inner">
        <div className="like-row">
          <button
            type="button"
            className={"like-button" + (liked ? " liked" : "")}
            onClick={toggleLike}
            disabled={loadingLike}
            aria-pressed={liked}
            aria-label={liked ? "Unlike this article" : "Like this article"}
          >
            <span className="like-icon" aria-hidden="true">
              {liked ? "♥" : "♡"}
            </span>
            <span className="like-label">{liked ? "Liked" : "Like"}</span>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>

        <div className="share-row">
          <span className="share-label">Share</span>

          <div className="share-buttons">
            {primaryShares.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn"
                style={{ ["--share-color"]: item.color }}
                aria-label={item.label}
                title={item.label}
                onClick={(e) => {
                  if (!shareUrl) e.preventDefault()
                }}
              >
                {item.name}
              </a>
            ))}

            <button
              type="button"
              className="share-btn copy-btn"
              onClick={copyLink}
              aria-label="Copy link"
              title="Copy link"
            >
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              type="button"
              className="share-btn more-btn"
              onClick={() => setOpenMore((v) => !v)}
              aria-expanded={openMore}
              title="More share options"
            >
              {openMore ? "Less" : "More"}
            </button>
          </div>

          {openMore && (
            <div className="share-buttons share-more">
              {moreShares.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.name === "Email" ? undefined : "_blank"}
                  rel={item.name === "Email" ? undefined : "noopener noreferrer"}
                  className="share-btn"
                  style={{ ["--share-color"]: item.color }}
                  aria-label={item.label}
                  title={item.label}
                  onClick={(e) => {
                    if (!shareUrl) e.preventDefault()
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}