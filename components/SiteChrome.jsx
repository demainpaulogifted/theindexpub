"use client";

import { useState } from "react";
import Link from "next/link";

export default function SiteChrome({
  children,
  siteName = "THE INDEX",
  description = "",
  categories = [],
  pages = [],
  socialLinks = [],
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            {siteName}
          </Link>

          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className="menu-lines">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {open && (
          <div className="container">
            <nav
              style={{
                padding: "20px 0 25px",
                borderTop: "1px solid #eee",
                display: "grid",
                gap: "12px",
              }}
            >
              <Link
                href="/"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>

              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/page/${page.slug}`}
                  onClick={() => setOpen(false)}
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="container">
        {categories.length > 0 && (
          <nav
            className="categories"
            aria-label="Article categories"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="category-link"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {description && (
        <div
          className="container"
          style={{ paddingTop: 15 }}
        >
          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            {description}
          </p>
        </div>
      )}

      {children}

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <div className="footer-brand">
                {siteName}
              </div>

              {description && (
                <p
                  style={{
                    maxWidth: 420,
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            <div>
              <div className="footer-links">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/page/${page.slug}`}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div
                  className="social-links"
                  style={{
                    marginTop: 18,
                  }}
                >
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label ||
                        social.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()}{" "}
            {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}