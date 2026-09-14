export function safeReturnPath(
  value: string | null | undefined,
  fallback = "/library",
) {
  if (!value || value.length > 300 || /[\\\u0000-\u001f\u007f]/.test(value))
    return fallback;
  return /^\/(?:library|moderation|account(?:\/[a-z-]+)?|mods\/(?:mod|sound)-[1-9]\d{0,9}(?:\/report)?|tools(?:\/[a-z-]+)?)$/.test(
    value,
  )
    ? value
    : fallback;
}
