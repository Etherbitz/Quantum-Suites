export const PLANS = {
  free: {
    websites: 1,
    scanFrequency: "once",
    continuousMonitoring: false,
    detailedReports: false,
    changeAlerts: false,
    auditTrail: false,
    suggestions: false,
  },

  starter: {
    websites: 1,
    scanFrequency: "weekly",
    continuousMonitoring: false,
    detailedReports: false,
    changeAlerts: false,
    auditTrail: false,
    suggestions: false,
  },

  business: {
    websites: 10,
    scanFrequency: "continuous",
    continuousMonitoring: true,
    detailedReports: true,
    changeAlerts: true,
    auditTrail: true,
    suggestions: true,
  },

  agency: {
    websites: Infinity,
    scanFrequency: "continuous",
    continuousMonitoring: true,
    detailedReports: true,
    changeAlerts: true,
    auditTrail: true,
    suggestions: true,
    whiteLabel: true,
    centralDashboard: true,
  },
} as const;

export type Plan = keyof typeof PLANS;
