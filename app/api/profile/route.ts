import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

function sanitizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function GET() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await getOrCreateUser(
    userId,
    clerkUser.emailAddresses[0].emailAddress
  );

  const profile = {
    email: user.email,
    firstName: (user as any).firstName ?? clerkUser.firstName ?? "",
    lastName: (user as any).lastName ?? clerkUser.lastName ?? "",
    company: (user as any).company ?? "",
    jobTitle: (user as any).jobTitle ?? "",
    phone:
      (user as any).phone ??
      (clerkUser.phoneNumbers?.[0]?.phoneNumber ?? ""),
    timezone: (user as any).timezone ?? "",
    locale: (user as any).locale ?? "",
    addressLine1: (user as any).addressLine1 ?? "",
    addressLine2: (user as any).addressLine2 ?? "",
    city: (user as any).city ?? "",
    state: (user as any).state ?? "",
    postalCode: (user as any).postalCode ?? "",
    country: (user as any).country ?? "",
    marketingOptIn: Boolean((user as any).marketingOptIn),
  };

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await getOrCreateUser(
    userId,
    clerkUser.emailAddresses[0].emailAddress
  );

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_BODY", reason: "Body must be valid JSON" },
      { status: 400 }
    );
  }

  const updateData: any = {
    company: sanitizeString(body.company),
    jobTitle: sanitizeString(body.jobTitle),
    phone: sanitizeString(body.phone),
    timezone: sanitizeString(body.timezone),
    locale: sanitizeString(body.locale),
    addressLine1: sanitizeString(body.addressLine1),
    addressLine2: sanitizeString(body.addressLine2),
    city: sanitizeString(body.city),
    state: sanitizeString(body.state),
    postalCode: sanitizeString(body.postcode ?? body.postalCode),
    country: sanitizeString(body.country),
    firstName: sanitizeString(body.firstName),
    lastName: sanitizeString(body.lastName),
  };

  if (typeof body.marketingOptIn === "boolean") {
    updateData.marketingOptIn = body.marketingOptIn;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({
    email: updated.email,
    firstName: (updated as any).firstName ?? "",
    lastName: (updated as any).lastName ?? "",
    company: (updated as any).company ?? "",
    jobTitle: (updated as any).jobTitle ?? "",
    phone: (updated as any).phone ?? "",
    timezone: (updated as any).timezone ?? "",
    locale: (updated as any).locale ?? "",
    addressLine1: (updated as any).addressLine1 ?? "",
    addressLine2: (updated as any).addressLine2 ?? "",
    city: (updated as any).city ?? "",
    state: (updated as any).state ?? "",
    postalCode: (updated as any).postalCode ?? "",
    country: (updated as any).country ?? "",
    marketingOptIn: Boolean((updated as any).marketingOptIn),
  });
}
