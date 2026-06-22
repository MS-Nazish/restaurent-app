import LoginForm from '../../components/shared/LoginForm'

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant App</h1>
          <p className="text-gray-500 mt-2">Staff Login</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage