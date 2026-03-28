// Generador simple de IDs únicos sin dependencias externas
export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
