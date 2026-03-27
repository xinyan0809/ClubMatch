import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center justify-center gap-4 pt-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200">
          <span className="text-2xl font-bold text-white">CM</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Welcome to <span className="text-primary-600">ClubMatch</span>
        </h1>
        <p className="max-w-md text-base text-gray-500">
          Discover university clubs tailored to your passions. Connect, join,
          and belong.
        </p>
      </div>
    </div>
  );
}
