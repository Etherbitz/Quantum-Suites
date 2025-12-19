import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled = Boolean(publishableKey);

  return (
    <>
      {clerkEnabled ? (
        <ClerkProvider publishableKey={publishableKey}>
          <html lang="en">
            <body>{children}</body>
          </html>
        </ClerkProvider>
      ) : (
        <html lang="en">
          <body className="min-h-screen bg-black text-white">
            <div className="bg-gradient-to-r from-fuchsia-500/10 via-cyan-400/10 to-emerald-400/10 border-b border-white/5 px-4 py-2 text-center text-sm text-white/80">
              Authentication is running in demo mode. Add{" "}
              <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to
              enable live sign-in.
            </div>
            {children}
          </body>
        </html>
      )}
    </>
  );
}
