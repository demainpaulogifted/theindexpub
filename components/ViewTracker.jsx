"use client";

import { useEffect } from "react";

export default function ViewTracker({ articleId }) {
  useEffect(() => {
    if (!articleId) return;

    const trackView = async () => {
      try {
        await fetch("/api/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            articleId
          })
        });
      } catch (error) {
        console.error("View tracking failed:", error);
      }
    };

    trackView();
  }, [articleId]);

  return null;
}
