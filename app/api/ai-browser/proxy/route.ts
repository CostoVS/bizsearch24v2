import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("URL is required", { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new NextResponse(`Error fetching target site: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "text/html";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      // If it is an image or stylesheet, redirect to the direct absolute URL
      return NextResponse.redirect(url);
    }

    let html = await response.text();

    // Strip any meta Content-Security-Policy tag that blocks script/style execution in the iframe
    html = html.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "");

    const resolveUrl = (relative: string) => {
      try {
        return new URL(relative, url).href;
      } catch (e) {
        return relative;
      }
    };

    // Rewrite relative src/href paths to absolute URLs so styles, scripts, and images load correctly
    html = html.replace(/(src|href|action)=["']\s*([^"']+)\s*["']/gi, (match, attr, val) => {
      if (
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("data:") ||
        val.startsWith("javascript:") ||
        val.startsWith("tel:") ||
        val.startsWith("mailto:") ||
        val.startsWith("#")
      ) {
        return `${attr}="${val}"`;
      }
      return `${attr}="${resolveUrl(val)}"`;
    });

    // Inject a script inside the iframe to intercept all internal anchor clicks
    // and route them through this proxy recursively, keeping the user in the app sandbox
    const injectedScript = `
      <script>
        document.addEventListener('click', function(e) {
          var target = e.target.closest('a');
          if (target && target.href) {
            var href = target.href;
            if (href.startsWith('http') && !href.includes(window.location.host)) {
              e.preventDefault();
              window.location.href = window.location.pathname + '?url=' + encodeURIComponent(href);
            }
          }
        }, true);
      </script>
    `;

    if (html.includes("</body>")) {
      html = html.replace("</body>", `${injectedScript}</body>`);
    } else {
      html += injectedScript;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; frame-src *; connect-src *;",
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(`Proxy failed to fetch webpage: ${err.message}`, { status: 500 });
  }
}
