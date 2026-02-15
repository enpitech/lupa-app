import { User } from '@/types/user';
import { sendEventCleverTap } from './cleverTap';

import { ENV, Events } from './appConst';
import { loginDataDogUser } from './dataDog';

declare global {
  interface Window {
    dataLayer: Array<{ event: string; [key: string]: unknown }>;
    sendEventCleverTap?: typeof sendEventCleverTap;
  }
}

export const initializeAnalytics = () => {
  if (process.env.NODE_ENV === ENV.PROD) {
    if (!window.sendEventCleverTap) {
      window.sendEventCleverTap = sendEventCleverTap;
    }
  }
};

export const loginAnalytics = (user: User) => {
  if (process.env.NODE_ENV === ENV.PROD) {
    loginDataDogUser(user);
  }
};
export const sendEvent = <T extends keyof Events>(
  eventName: T,
  eventData: Events[T]
): void => {
  if (window.sendEventCleverTap) {
    window.sendEventCleverTap(eventName, eventData);
  }

  //call send event to google analytics
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...eventData });
};
