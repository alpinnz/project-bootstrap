/**
 * Entry point for the TypeScript capability scaffold.
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

if (import.meta.url === new URL(process.argv[1] ?? '', 'file:').href) {
  console.log(greet('world'));
}
