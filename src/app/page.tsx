import { redirect } from "next/navigation";

// Gateway: always route unauthenticated visitors to the login page.
// Once real Supabase session checking is wired up, replace this with
// a server-side auth guard that only redirects when no session exists.
export default function RootPage() {
  redirect("/login");
}
