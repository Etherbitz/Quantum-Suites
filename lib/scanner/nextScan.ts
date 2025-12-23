export function computeNextScanAt(
  from: Date,
  intervalMinutes: number
) {
  return new Date(from.getTime() + intervalMinutes * 60 * 1000);
}
