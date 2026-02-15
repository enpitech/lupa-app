import { useUserStore } from '@/stores/user';

export const useReportBI = () => {
  const user = useUserStore((store) => store.user);
  console.log(user);
};
