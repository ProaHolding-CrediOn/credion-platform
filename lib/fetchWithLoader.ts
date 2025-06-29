import { useLoadingStore } from '@/lib/stores/loading';

export async function fetchWithLoader(input: RequestInfo, init?: RequestInit) {
  const { setLoading } = useLoadingStore.getState();
  setLoading(true);
  try {
    const res = await fetch(input, init);
    return res;
  } finally {
    setLoading(false);
  }
}