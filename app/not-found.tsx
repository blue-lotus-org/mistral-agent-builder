import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e1e1e] text-gray-300 p-4">
      <div className="text-blue-400 font-semibold text-2xl mb-4 flex items-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path
            d="M12 2L4 6V18L12 22L20 18V6L12 2Z"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 22V14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 6L12 14L4 6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18L12 14L20 18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Mistalic
      </div>

      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl mb-6">Page Not Found</h2>

      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
        Return to IDE
      </Link>
    </div>
  )
}

