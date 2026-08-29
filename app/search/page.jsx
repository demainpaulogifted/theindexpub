"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchArticles(event) {
    event.preventDefault();

    const value = query.trim();

    if (!value) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(value)}`
      );

      const data = await response.json();

      setResults(data.articles || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="articles-section">
      <div className="container">
        <p className="hero-label">THE INDEX</p>

        <h1 className="section-heading">
          Search
        </h1>

        <form
          onSubmit={searchArticles}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 40
          }}
        >
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search articles..."
            aria-label="Search articles"
            style={{
              flex: 1,
              padding: "14px 16px",
              border: "1px solid #ddd",
              borderRadius: 12
            }}
          />

          <button
            type="submit"
            style={{
              padding: "14px 20px",
              border: 0,
              borderRadius: 12,
              background: "#111",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </form>

        {loading && (
          <p style={{ color: "#666" }}>
            Searching...
          </p>
        )}

        {!loading && query && results.length === 0 && (
          <p style={{ color: "#666" }}>
            No matching articles found.
          </p>
        )}

        {results.length > 0 && (
          <div className="article-grid">
            {results.map((article) => (
              <article
                className="article-card"
                key={article.id}
              >
                {article.featured_image ? (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="article-image"
                  />
                ) : (
                  <div className="article-image" />
                )}

                {article.categories && (
                  <div className="article-category">
                    {article.categories.name}
                  </div>
                )}

                <h2>
                  <Link href={`/article/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>

                {article.excerpt && (
                  <p className="article-excerpt">
                    {article.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
