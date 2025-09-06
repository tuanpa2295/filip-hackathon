import axios, { AxiosError } from 'axios';

export class APIError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const message = (axiosError.response?.data as any)?.message || axiosError.message;
    
    switch (status) {
      case 400:
        return new APIError('Invalid request. Please check your input.', status);
      case 401:
        return new APIError('Authentication required. Please login again.', status);
      case 403:
        return new APIError('You do not have permission to perform this action.', status);
      case 404:
        return new APIError('The requested resource was not found.', status);
      case 500:
        return new APIError('Server error. Please try again later.', status);
      default:
        return new APIError(message || 'Something went wrong', status);
    }
  }
  
  return new APIError('An unexpected error occurred');
}
