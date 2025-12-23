"use client";

import Link from "next/link";
import { CheckCircle2, Shield, Activity, TrendingUp } from "lucide-react";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import type { ReactNode } from "react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-indigo-600 mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-semibold text-white mb-3">
          Welcome to Quantum Suites! 🎉
        </h1>
        
        <p className="text-lg text-neutral-400">
          Your account is ready. Here&apos;s what you can do now:
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <FeatureCard
          icon={<Shield className="w-6 h-6" />}
          title="Scan Your Website"
          description="Get instant compliance insights and risk analysis"
          gradient="from-cyan-500 to-blue-600"
        />
        
        <FeatureCard
          icon={<Activity className="w-6 h-6" />}
          title="Monitor Changes"
          description="Track compliance status over time with automated scans"
          gradient="from-blue-600 to-indigo-600"
        />
        
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="View Analytics"
          description="Get detailed reports and actionable recommendations"
          gradient="from-indigo-600 to-purple-600"
        />
      </div>

      {/* Getting Started Steps */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">
          Get Started in 3 Easy Steps
        </h2>
        
        <div className="space-y-4">
          <Step
            number={1}
            title="Run your first scan"
            description="Enter your website URL and get instant compliance feedback"
          />
          <Step
            number={2}
            title="Review the results"
            description="See what compliance issues were detected and get recommendations"
          />
          <Step
            number={3}
            title="Track over time"
            description="Monitor your compliance score and get alerts for changes"
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/scan">
          <PrimaryButton onClick={onComplete}>
            Start Your First Scan
          </PrimaryButton>
        </Link>
        
        <Link href="/dashboard">
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-lg border border-neutral-700 text-white hover:bg-neutral-800 transition font-medium"
          >
            Go to Dashboard
          </button>
        </Link>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-neutral-500 mt-8">
        You&apos;re currently on the <span className="text-white font-medium">Free Plan</span>.
        <Link href="/pricing" className="text-cyan-400 hover:underline ml-1">
          Upgrade for more features
        </Link>
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br ${gradient} mb-4`}>
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
        {number}
      </div>
      
      <div>
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  );
}
