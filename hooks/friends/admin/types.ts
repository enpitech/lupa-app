import { friendsInviteTypeEnum } from '@/utils/appConst';

export interface Friend {
  name: string;
  master_token: string;
  is_connected?: boolean;
}

export interface FriendListResponse {
  isValid: boolean;
  Error: string;
  payload: {
    friends: Friend[];
    link_type: InviteType;
    name: string;
  };
}

export interface FriendInviteResponse {
  isValid: boolean;
  Error: string;
  payload: {
    temporaryMessage: string;
    link_url: string;
  };
}

export interface ChangeFriendInviteTypeResponse {
  isValid: boolean;
  Error: string;
  payload: {
    event_token: string;
    event_link: string;
    event_link_type: InviteType;
    link_url: string;
  };
}

export interface ApproveFriendResponse {
  isValid: boolean;
  Error: string | null;
  payload: Record<string, unknown> | null;
}

export interface DeleteFriendResponse {
  isValid: boolean;
  Error: string | null;
  payload: Record<string, unknown> | null;
}

export interface DestroyInviteResponse {
  isValid: boolean;
  Error: string | null;
  payload: Record<string, unknown> | null;
}

export type InviteType =
  | friendsInviteTypeEnum.PUBLIC
  | friendsInviteTypeEnum.PRIVATE;
