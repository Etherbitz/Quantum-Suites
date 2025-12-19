import { redirect } from "next/navigation";

/**
 * Legacy /login route - redirects to /sign-in
 */
export default function LoginPage() {
  redirect("/sign-in");
}
