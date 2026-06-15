import Link from "next/link";

export const metadata = {
  title: "Under Maintenance · RenewCanvas Africa",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <img
          src="/brand/renewcanvas-icon-full-color.png"
          alt="RenewCanvas Africa logo"
          className="mx-auto mb-6 h-16 w-16"
        />
        <h1 className="text-2xl font-bold text-gray-900">We&apos;ll be right back</h1>
        <p className="mt-3 text-gray-600">
          RenewCanvas Africa is currently undergoing scheduled maintenance. The
          marketplace will be available again shortly — thank you for your patience.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Are you an administrator?{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            Sign in
          </Link>{" "}
          to manage the platform.
        </p>
      </div>
    </main>
  );
}
