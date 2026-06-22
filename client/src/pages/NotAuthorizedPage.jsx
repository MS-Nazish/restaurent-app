function NotAuthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <p className="text-gray-500 mt-4">You are not authorized to view this page</p>
        <a href="/login" className="mt-6 inline-block text-blue-600 hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  )
}

export default NotAuthorizedPage