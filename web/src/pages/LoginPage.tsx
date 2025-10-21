import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">CourierCue</h1>
          <p className="text-gray-600">Delivery Management System</p>
        </div>
        
        <button
          onClick={login}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign In with Cognito
        </button>
        
        <p className="text-center text-sm text-gray-600">
          Sign in using your organization credentials
        </p>
      </div>
    </div>
  );
}
