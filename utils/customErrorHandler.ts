import {
  CustomErrorDetails,
  CustomErrorResponse,
} from '@/types/customError';
import { PATHS, ERROR_CODES } from './appConst';
import { useCustomErrorStore } from '@/stores/customError';
// TODO: Replace with React Navigation router for RN
// import { router } from '@/router';

export const isCustomError = (error: unknown): error is CustomErrorResponse => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as Record<string, unknown>;
  return err.Error === ERROR_CODES.CUSTOM_MESSAGE;
};

export const extractErrorDetails = (
  error: unknown
): CustomErrorDetails | null => {
  if (!isCustomError(error)) {
    return null;
  }

  if (error.errorDetails) {
    return error.errorDetails;
  }

  // Check nested response.errorDetails
  if (
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'errorDetails' in error.response
  ) {
    return error.response.errorDetails as CustomErrorDetails;
  }

  return null;
};

export const handleCustomError = (error: unknown): void => {
  if (!isCustomError(error)) {
    return;
  }

  const errorDetails = extractErrorDetails(error);
  if (!errorDetails) {
    return;
  }

  useCustomErrorStore.getState().setError(errorDetails);

  // TODO: Replace with React Navigation for RN
  // router.navigate(PATHS.ERROR_SCREEN);
};
