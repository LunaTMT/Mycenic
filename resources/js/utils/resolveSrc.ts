export function resolveSrc(src: string, source?: string): string {
  if (typeof source === "string" && source.trim() !== "" && (source.startsWith("http://") || source.startsWith("https://"))) {
    return source;
  }

  if (typeof src === "string" && src.trim() !== "" && (src.startsWith("http://") || src.startsWith("https://"))) {
    return src;
  }

  return src ? `/${src}` : '';
}




 