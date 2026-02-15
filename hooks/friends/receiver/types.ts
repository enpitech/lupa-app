import { InviteType } from '../admin/types';
export interface FriendShareInfo {
  master_name: string;
  event_name: string;
  sharing_status: InviteType;
  is_closed: boolean;
  event_token?: string;
  is_exists: boolean;
}

export interface FriendShareInfoResponse {
  isValid: boolean;
  Error: string | null;
  payload: FriendShareInfo;
}

export interface FriendRequestResponse {
  isValid: boolean;
  Error: string | null;
  payload: {
    event_link_type: InviteType;
    event_token: string;
  };
}

export enum modalVariantEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
  APPROVED = 'approved',
}
