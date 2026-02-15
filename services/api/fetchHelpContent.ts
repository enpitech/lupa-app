import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export interface StoryItem {
  url: string;
  text?: string;
}

export interface StoryGroup {
  id: string;
  title: string;
  preview: string;
  items: StoryItem[];
}

export interface Article {
  link: string;
  text: string;
}

interface RouteHelpContent {
  storyGroups?: StoryGroup[] | 'default';
  articles?: Article[];
}

export interface HelpContentResponse {
  default: {
    storyGroups: StoryGroup[];
    articles: Article[];
    reportBugTypeform?: string;
    feedbackTypeform?: string;
  };
  routes: Record<string, RouteHelpContent>;
}

interface ApiResponse {
  payload?: HelpContentResponse;
}

export const fetchHelpContent = async ({
  token,
  language,
}: {
  token: string;
  language: string;
}) => {
  const params: Record<string, string> = {
    token,
    lang: language,
    resp: 'full',
    isCustomErr: 'false',
  };

  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.gethelp,
        params,
      })
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch help content: ${response.statusText} (${response.status})`
      );
    }

    const data: ApiResponse = await response.json();

    if (!data.payload) {
      throw new Error('Invalid response format from the server');
    }

    return data.payload as HelpContentResponse;
  } catch (error) {
    trackApiError(error as Error, apiMethods.gethelp, {
      statusCode: (error as { status?: number })?.status,
      language,
    });
    throw error;
  }
};
