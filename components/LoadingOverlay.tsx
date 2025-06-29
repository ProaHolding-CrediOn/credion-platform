'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoadingStore } from '@/lib/stores/loading';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
    const { theme } = useTheme();
  const pathname = usePathname();
  const { loading, setLoading } = useLoadingStore();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setLocalLoading(true);
    const timeout = setTimeout(() => setLocalLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  const show = loading || localLoading;

  if (!show) return null;

  const bgColor =
    theme === 'dark'
      ? 'bg-neutral-950/70'
      : 'bg-white/70';

  return (
    <div className={`fixed inset-0 z-50 ${bgColor} flex items-center justify-center backdrop-blur-sm transition-opacity`}>
      <Loader2 className='animate-spin text-muted h-10 w-10' />
    </div>
  );
}
