import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      <p className="mt-2 text-gray-500">Manage your student profile and club memberships.</p>
    </div>
  );
}
