export function resolveImageSrc(path: string): string {
  if (path.includes('unsplash.com')) {
    return path;
  }

  return '/' + path.replace(/^\/+/, '');
}
