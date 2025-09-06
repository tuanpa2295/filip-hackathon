import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"

interface ErrorPageProps {
  error?: string
  onRetry?: () => void
}

export const ErrorPage = ({ error = "Something went wrong", onRetry }: ErrorPageProps) => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-4 text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Error Occurred</h1>
        <p className="text-base text-gray-600">{error}</p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Button>
          {onRetry && (
            <Button 
              variant="outline"
              onClick={onRetry}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
