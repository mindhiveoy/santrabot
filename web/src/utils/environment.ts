export function isNode(): boolean {
  return (
    typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node !== 'undefined'
  );
}

export function isBrowser(): boolean {
  return !isNode();
}

export function isDevMode(): boolean {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
}

export function isServerSide(): boolean {
  const p: any = process;
  if (p) {
    // Needed for development time debugging in vscode
    return p.title !== 'browser';
  }
  return false;
}
