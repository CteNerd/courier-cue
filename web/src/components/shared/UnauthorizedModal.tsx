import { useNavigate } from 'react-router-dom';

interface UnauthorizedModalProps {
  isOpen: boolean;
  message?: string;
  onClose?: () => void;
  redirectTo?: string;
}

export default function UnauthorizedModal({ 
  isOpen, 
  message = "You don't have permission to access this page.", 
  onClose,
  redirectTo = '/dashboard'
}: UnauthorizedModalProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    }
    navigate(redirectTo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg 
              className="h-6 w-6 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-2">
            Access Denied
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              OK, Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}