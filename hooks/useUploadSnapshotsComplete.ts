import { fetchUploadSnapshotsComplete } from '@/services/api/fetchUplodeSnapshotsComplete';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';

export const useUploadSnapshotsComplete = ({
  eventToken,
  orderId,
  uploadStatus,
  enabled,
}: {
  eventToken: string;
  orderId: string;
  uploadStatus: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: [QUERY_KEY.UPLOAD_SNAPSHOTS_COMPLETE],
    queryFn: () =>
      fetchUploadSnapshotsComplete({ eventToken, orderId, uploadStatus }),
    enabled,
  });
};
