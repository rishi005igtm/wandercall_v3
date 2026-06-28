import { AxiosError } from 'axios';

export function mapApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Network error. Please check your internet connection and try again.';
    }

    const status = error.response.status;
    const responseData = error.response.data as { message?: string | string[]; error?: string };

    if (responseData?.message) {
      if (Array.isArray(responseData.message)) {
        return responseData.message[0];
      }
      return responseData.message;
    }

    switch (status) {
      case 400:
        return 'Bad request. Please check your input fields.';
      case 401:
        return 'Authentication required or invalid credentials.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Requested resource was not found.';
      case 409:
        return 'Conflict detected. Resource or username already exists.';
      case 429:
        return 'Too many requests. Please slow down and try again in a moment.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Our engineering team has been notified.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}
