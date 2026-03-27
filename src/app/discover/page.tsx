import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
};

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Discover Clubs</h1>
      <p className="mt-2 text-gray-500">Browse all clubs at your university.</p>
    </div>
  );
}
