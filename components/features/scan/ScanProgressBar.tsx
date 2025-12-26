type ScanProgressBarProps = {
  progress: number;
};

export function ScanProgressBar({ progress }: ScanProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-blue-600 transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
