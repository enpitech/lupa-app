import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFriendList } from '@/services/api/fetchFriendList';
import { fetchFriendInvite } from '@/services/api/fetchFriendInvite';
import { changeFriendInviteType } from '@/services/api/changeFriendInviteType';
import { approveFriend } from '@/services/api/approveFriend';
import { deleteFriend } from '@/services/api/deleteFriend';
import { destroyInvite } from '@/services/api/destroyInvite';
import {
  FriendListResponse,
  FriendInviteResponse,
  InviteType,
} from '@/hooks/friends/admin/types';
import { friendsInviteTypeEnum } from '@/utils/appConst';
import useAlbumStore from '@/stores/album';
// Enum for category - shared books are PUBLIC, private books are PRIVATE
export enum AlbumCategory {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export const useFriendList = (eventToken: string, enabled: boolean = true) => {
  return useQuery<FriendListResponse, Error>({
    queryKey: ['friendList', eventToken],
    queryFn: () => fetchFriendList(eventToken),
    enabled: enabled && !!eventToken,
  });
};

export const useFriendInvite = (
  eventToken: string,
  linkType: InviteType = friendsInviteTypeEnum.PUBLIC,
  enabled: boolean = true
) => {
  return useQuery<FriendInviteResponse, Error>({
    queryKey: ['friendinvite2', eventToken],
    queryFn: () => fetchFriendInvite(eventToken, linkType),
    enabled: enabled && !!eventToken,
  });
};

export const useChangeFriendInviteType = (eventToken: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLinkType: InviteType) =>
      changeFriendInviteType(eventToken, newLinkType),
    onSuccess: (data, newLinkType) => {
      // Update the friendInvite cache with new link data
      queryClient.setQueryData(
        ['friendinvite2', eventToken],
        (oldData: FriendInviteResponse | undefined) => {
          if (!oldData || !data.payload?.link_url) return oldData;

          return {
            ...oldData,
            payload: {
              ...oldData.payload,
              link_url: data.payload.link_url,
            },
          } as FriendInviteResponse;
        }
      );

      queryClient.setQueryData(
        ['friendList', eventToken],
        (oldData: FriendListResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            payload: {
              ...oldData.payload,
              link_type: newLinkType,
            },
          };
        }
      );
    },
    onError: (error) => {
      console.error('Failed to change invite type:', error);
    },
  });
};

export const useApproveFriend = (eventToken: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (masterToken: string) => approveFriend(eventToken, masterToken),

    // Optimistic update for better UX (happens immediately)
    onMutate: async (masterToken: string) => {
      const previousFriends = queryClient.getQueryData([
        'friendList',
        eventToken,
      ]);
      queryClient.setQueryData(
        ['friendList', eventToken],
        (old: FriendListResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            payload: {
              ...old.payload,
              friends: old.payload.friends.map((friend) =>
                friend.master_token === masterToken
                  ? { ...friend, is_connected: true }
                  : friend
              ),
            },
          };
        }
      );

      return { previousFriends };
    },

    // Rollback on error
    onError: (err, masterToken, context) => {
      console.error(
        `Error deleting friend: ${err} with masterToken: ${masterToken}`
      ); // Rollback to previous state
      if (context?.previousFriends) {
        queryClient.setQueryData(
          ['friendList', eventToken],
          context.previousFriends
        );
      }
    },
  });
};

export const useDeleteFriend = (eventToken: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (masterToken: string) => deleteFriend(eventToken, masterToken),
    // Optimistic update for better UX (happens immediately)
    onMutate: async (masterToken: string) => {
      const previousFriends = queryClient.getQueryData([
        'friendList',
        eventToken,
      ]);

      queryClient.setQueryData(
        ['friendList', eventToken],
        (old: FriendListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            payload: {
              ...old.payload,
              friends: old.payload.friends.filter(
                (friend) => friend.master_token !== masterToken
              ),
            },
          };
        }
      );

      return { previousFriends };
    },

    onError: (err, masterToken, context) => {
      console.error(
        `Error approving friend: ${err} with masterToken: ${masterToken}`
      );
      // Rollback to previous state
      if (context?.previousFriends) {
        queryClient.setQueryData(
          ['friendList', eventToken],
          context.previousFriends
        );
      }
    },
  });
};

export const useDestroyInvite = (eventToken: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => destroyInvite(eventToken),
    onMutate: () => {
      // Set album category to PRIVATE meaning book is  unshared
      useAlbumStore.getState().setCategory(AlbumCategory.PRIVATE);
      // Snapshot the previous state
      const previousFriendData = queryClient.getQueryData<FriendListResponse>([
        'friendList',
        eventToken,
      ]);
      // Update the 'friendList' cache to an empty friends array and link_type set to PUBLIC
      queryClient.setQueryData(
        ['friendList', eventToken],
        (oldData: FriendListResponse | undefined) => {
          if (!oldData) {
            return undefined;
          }
          return {
            ...oldData,
            payload: {
              ...oldData.payload,
              friends: [],
              link_type: friendsInviteTypeEnum.PUBLIC,
            },
          };
        }
      );
      return { previousFriendData };
    },
    onError: (err, variables, context) => {
      console.error(
        'Failed to destroy invite with variables',
        variables,
        'and error',
        err
      );
      // Roll back to the previous state using the context from onMutate
      if (context?.previousFriendData) {
        queryClient.setQueryData(
          ['friendList', eventToken],
          context.previousFriendData
        );
      }

      // Also roll back the album store state
      useAlbumStore.getState().setCategory(AlbumCategory.PUBLIC);
    },
  });
};

// Explain complex logic :
// First flow : for unshared private albums - friendInvite -> friendList + set album.category to PUBLIC meaning shareable
// Second flow : for public albums - friendList -> friendInvite
export const useConditionalFriendData = (
  eventToken: string,
  albumCategory: string
) => {
  const isPrivateAlbum = albumCategory.toUpperCase() === AlbumCategory.PRIVATE;

  // For private albums
  const friendInviteQuery = useFriendInvite(
    eventToken,
    friendsInviteTypeEnum.PUBLIC,
    isPrivateAlbum
  );

  // For both flows
  const friendListEnabled = isPrivateAlbum ? !!friendInviteQuery.data : true;
  const friendListQuery = useFriendList(eventToken, friendListEnabled);

  // For public albums
  const publicAlbumInviteEnabled = !isPrivateAlbum && !!friendListQuery.data;
  const publicAlbumInviteQuery = useFriendInvite(
    eventToken,
    friendListQuery.data?.payload?.link_type || friendsInviteTypeEnum.PUBLIC,
    publicAlbumInviteEnabled
  );

  // If we called the useFriendInvite api first, we set album category to PUBLIC meaning book is now shareable
  if (isPrivateAlbum && friendInviteQuery.isSuccess) {
    useAlbumStore.getState().setCategory(AlbumCategory.PUBLIC);
  }

  return {
    friendList: friendListQuery,
    friendInvite: isPrivateAlbum ? friendInviteQuery : publicAlbumInviteQuery,
    isLoading: isPrivateAlbum
      ? friendInviteQuery.isLoading || friendListQuery.isLoading
      : friendListQuery.isLoading || publicAlbumInviteQuery.isLoading,
    error:
      friendListQuery.error ||
      (isPrivateAlbum ? friendInviteQuery.error : publicAlbumInviteQuery.error),
  };
};
