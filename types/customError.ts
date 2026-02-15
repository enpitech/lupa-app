import { ERROR_CODES } from '@/utils/appConst';

export interface CustomErrorDetails {
  url_image: string;
  title: string;
  description: string;
  button_cancel: string;
  button_cancel_action: string;
  button_approve: string;
  button_approve_action: string;
}

export interface CustomErrorResponse {
  isValid: false;
  errorCode: number;
  Error: typeof ERROR_CODES.CUSTOM_MESSAGE;
  errorDetails: CustomErrorDetails;
}
