import React from 'react';

interface ComplianceScoreProps {
  score: number;
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({ score }) => {
  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Compliance Score</h2>
      <p className="text-3xl font-bold text-green-600">{score}%</p>
      <div className="mt-2 bg-gray-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};