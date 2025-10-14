// lib/media.ts

/**
 * Normalize any stored media reference (filename, relative path, or absolute URL)
 * into the API path that can be requested from the current origin.
 */
export function buildImageRequestPath(value?: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Already a properly formatted API path
  if (trimmed.startsWith('/api/images/')) {
    return trimmed
  }

  let candidate = trimmed

  // If this is an absolute URL, extract the pathname portion
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      if (url.pathname.startsWith('/api/images/')) {
        return url.pathname
      }
      candidate = url.pathname
    } catch {
      // Fall through and treat the original string as a path/filename
      candidate = trimmed
    }
  }

  const segments = candidate
    .split('/')
    .map(part => part.trim())
    .filter(Boolean)

  const lastSegment = segments.pop()
  if (!lastSegment) return null

  const decoded = decodeURIComponent(lastSegment)
  return `/api/images/${encodeURIComponent(decoded)}`
}
