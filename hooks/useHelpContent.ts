import { useQuery } from '@tanstack/react-query';
import { fetchHelpContent } from '@/services/api/fetchHelpContent';
import { QUERY_KEY } from '@/utils/appConst';
import { useUserStore } from '@/stores/user';
import { useTranslationData } from '@/hooks/useTranslationData';

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

export interface HelpContent {
  storyGroups: StoryGroup[];
  articles: Article[];
  reportBugTypeform?: string;
  feedbackTypeform?: string;
}

type StoryGroupRef = StoryGroup[] | 'default';

type RouteHelpContent = {
  storyGroups?: StoryGroupRef;
  articles?: Article[];
};

interface HelpEndpointResponse {
  default: HelpContent & {
    reportBugTypeform?: string;
    feedbackTypeform?: string;
  };
  routes: Record<string, RouteHelpContent>;
}

const findMatchingRouteKey = (route: string, routes: Record<string, RouteHelpContent>) => {
  return Object.keys(routes)
    .sort((a, b) => b.length - a.length)
    .find(key => route.includes(key));
};

const resolveStoryGroups = (routeContent: RouteHelpContent | undefined, defaultContent: HelpContent) => {
  if (!routeContent?.storyGroups || routeContent.storyGroups === 'default') {
    return defaultContent.storyGroups;
  }

  return routeContent.storyGroups;
};

export const useHelpContent = (route: string) => {
  const { language } = useTranslationData();

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.FETCH_HELP_CONTENT, language],
    queryFn: () => {
      const token = useUserStore.getState().user?.token || '';
      return fetchHelpContent({ token, language });
    },
    enabled: !!useUserStore.getState().user?.token,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (response: HelpEndpointResponse) => {
      const routeKey = findMatchingRouteKey(route, response.routes);
      const routeContent = routeKey ? response.routes[routeKey] : undefined;
      const defaultContent = response.default;

      return {
        storyGroups: resolveStoryGroups(routeContent, defaultContent),
        articles:
          routeContent?.articles && routeContent.articles.length > 0
            ? routeContent.articles
            : defaultContent.articles,
        reportBugTypeform: defaultContent.reportBugTypeform,
        feedbackTypeform: defaultContent.feedbackTypeform,
      } as HelpContent;
    },
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error as Error | null
  };
};
