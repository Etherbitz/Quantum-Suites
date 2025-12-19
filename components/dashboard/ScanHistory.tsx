"use client";

import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";

interface Scan {
  id: string;
  url: string;
  score: number;
  riskLevel: string;
  createdAt: string;
}

interface ScanHistoryProps {
  scans: Scan[];
}

export function ScanHistory({ scans }: ScanHistoryProps) {
  if (scans.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No scans yet. Start by scanning your website!</p>
        <Link
          href="/scan"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Scan Website
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={scan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                  {scan.url}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(scan.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    scan.score >= 80
                      ? "bg-green-100 text-green-800"
                      : scan.score >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {scan.riskLevel} Risk
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800">{scan.score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>
          <Link
            href={`/scan/results?id=${scan.id}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:underline font-medium"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
