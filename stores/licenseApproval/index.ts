import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LicenseApprovalState {
  approvedVersion: string | null;
  approvalDate: string | null;
  setLicenseApproval: (version: string) => void;
  isVersionApproved: (currentVersion: string) => boolean;
  clearApproval: () => void;
}

export const useLicenseApprovalStore = create<LicenseApprovalState>()(
  persist(
    (set, get) => ({
      approvedVersion: null,
      approvalDate: null,

      setLicenseApproval: (version: string) => {
        const approvalDate = new Date().toISOString();
        set({
          approvedVersion: version,
          approvalDate,
        });
      },

      isVersionApproved: (currentVersion: string) => {
        const { approvedVersion } = get();
        if (!approvedVersion) {
          return false;
        }
        return approvedVersion === currentVersion;
      },

      clearApproval: () => set({ approvedVersion: null, approvalDate: null }),
    }),
    {
      name: 'license-approval',
      partialize: (state) => ({
        approvedVersion: state.approvedVersion,
        approvalDate: state.approvalDate,
      }),
    }
  )
);
