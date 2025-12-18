import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  accent?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, accent }) => {
  const accentClasses = accent === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${accentClasses}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};