export const PLANS = {
  free: {
    websites: 1,
    scanFrequency: "once",
    continuousMonitoring: false,
    detailedReports: false,
    changeAlerts: false,
    auditTrail: false,
    suggestions: false,
    price: 0,
    stripePriceId: null,
  },

  starter: {
    websites: 1,
    scanFrequency: "weekly",
    continuousMonitoring: false,
    detailedReports: false,
    changeAlerts: false,
    auditTrail: false,
    suggestions: false,
    price: 29,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },

  business: {
    websites: 10,
    scanFrequency: "continuous",
    continuousMonitoring: true,
    detailedReports: true,
    changeAlerts: true,
    auditTrail: true,
    suggestions: true,
    price: 79,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
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
    price: null, // Coming soon
    stripePriceId: null,
  },
} as const;

export type Plan = keyof typeof PLANS;
