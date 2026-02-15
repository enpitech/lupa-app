import { useTranslation } from '@/hooks/useTranslation';
import { fetchLicense, LicenseResponse } from '@/services/api/fetchLicense';
import { useLicenseApprovalStore } from '@/stores/licenseApproval';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
const LICENSE_STALE_TIME = 2 * 60 * 60 * 1000; // 2 hours

export const useLicenseApproval = () => {
  const [showRegulationsDialog, setShowRegulationsDialog] = useState(false);
  const { i18n } = useTranslation();

  const isVersionApproved = useLicenseApprovalStore(
    (state) => state.isVersionApproved
  );
  const setLicenseApproval = useLicenseApprovalStore(
    (state) => state.setLicenseApproval
  );

  const { data: licenseData, isLoading } = useQuery<LicenseResponse>({
    queryKey: [QUERY_KEY.FETCH_LICENSE, i18n.language],
    queryFn: fetchLicense,
    staleTime: LICENSE_STALE_TIME,
  });

  const needsApproval = (): boolean => {
    if (isLoading || !licenseData) {
      return false;
    }
    return !isVersionApproved(licenseData.payload.version);
  };

  const handleRegulationsConfirm = () => {
    if (licenseData?.payload.version) {
      setLicenseApproval(licenseData.payload.version);
    }
    setShowRegulationsDialog(false);
  };

  return {
    needsApproval: needsApproval(),
    showRegulationsDialog,
    setShowRegulationsDialog,
    handleRegulationsConfirm,
    licenseData,
  };
};
