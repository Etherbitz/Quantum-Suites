import React from 'react';

export const ScanTable: React.FC = () => {
  // Sample data - replace with actual data
  const scans = [
    { id: 1, website: 'example.com', status: 'Completed', issues: 3, lastScan: '2h ago' },
    { id: 2, website: 'test.com', status: 'In Progress', issues: 0, lastScan: '1d ago' },
  ];

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b">Recent Scans</h2>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Website</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Issues</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Last Scan</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id} className="border-t">
              <td className="px-4 py-2 text-sm">{scan.website}</td>
              <td className="px-4 py-2 text-sm">{scan.status}</td>
              <td className="px-4 py-2 text-sm">{scan.issues}</td>
              <td className="px-4 py-2 text-sm">{scan.lastScan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};