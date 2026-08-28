export function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (/^https?:\/\//i.test(t)) return true;
  return /^[\w-]+(\.[\w-]+)*\.[a-z]{2,24}(\/\S*)?$/i.test(t);
}
