"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Issue {
  severity: "critical" | "warning" | "info";
  message: string;
  category: string;
}

interface IssuesListProps {
  issues: Issue[];
}

export function IssuesList({ issues }: IssuesListProps) {
  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <p className="mt-4 text-green-700 font-medium">
          No issues detected! Your website looks great.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 ${getBgColor(issue.severity)}`}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(issue.severity)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase text-gray-600">
                  {issue.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    issue.severity === "critical"
                      ? "bg-red-200 text-red-800"
                      : issue.severity === "warning"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="text-gray-800">{issue.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
