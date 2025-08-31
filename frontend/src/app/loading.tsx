// Global loading UI for Next.js App Router
// Must default-export a React Component

export default function Loading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-transparent">
			<div
				className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"
				aria-label="Loading"
				role="status"
			/>
		</div>
	);
}

