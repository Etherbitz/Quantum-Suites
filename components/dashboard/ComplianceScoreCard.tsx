"use client";

interface ComplianceScoreProps {
  score: number;
  riskLevel: string;
}

export function ComplianceScoreCard({ score, riskLevel }: ComplianceScoreProps) {
  const getColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getBgColor = () => {
    if (score >= 80) return "bg-green-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getBorderColor = () => {
    if (score >= 80) return "border-green-200";
    if (score >= 50) return "border-yellow-200";
    return "border-red-200";
  };

  return (
    <div className={`rounded-xl border-2 ${getBorderColor()} ${getBgColor()} p-8 text-center`}>
      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        Compliance Score
      </h3>
      <div className={`mt-4 text-6xl font-bold ${getColor()}`}>
        {score}
      </div>
      <div className={`mt-2 text-lg font-semibold ${getColor()} capitalize`}>
        {riskLevel} Risk
      </div>
      <p className="mt-4 text-sm text-gray-600">
        {score >= 80 && "Your website has minimal compliance risks"}
        {score >= 50 && score < 80 && "Some compliance issues detected"}
        {score < 50 && "Significant compliance issues need attention"}
      </p>
    </div>
  );
}
