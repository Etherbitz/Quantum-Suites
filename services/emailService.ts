import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.MONITORING_EMAIL_FROM ||
  "Quantum Suites AI <no-reply@quantumsuites-ai.com>";

let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn(
    "RESEND_API_KEY not set. Weekly monitoring emails will be logged but not sent."
  );
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  if (!resend) {
    console.error("EMAIL_SEND_SKIPPED_NO_PROVIDER", {
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
  } catch (err) {
    console.error("EMAIL_SEND_FAILED", err);
  }
}
