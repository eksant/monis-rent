// "1 item", "2 items": English plural for a simple count.
export function countLabel(count: number, noun: string): string {
  return `${String(count)} ${noun}${count === 1 ? "" : "s"}`;
}
