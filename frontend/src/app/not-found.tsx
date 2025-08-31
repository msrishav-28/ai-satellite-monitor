// Global not-found UI for Next.js App Router
// Must default-export a React Component

import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<h1 className="text-xl font-semibold">Page not found</h1>
			<p className="text-sm text-gray-500">The page you’re looking for doesn’t exist.</p>
			<Link href="/" className="text-blue-600 hover:underline">Go back home</Link>
		</div>
	);
}

