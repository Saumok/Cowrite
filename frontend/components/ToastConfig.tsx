'use client';

import { useEffect } from 'react';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';

export function ToastConfig() {
  const { toasts } = useToasterStore();

  // Limit active toasts to max 3
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .slice(3)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  const glassBase = {
    background: 'rgba(250, 247, 242, 0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.72)',
    borderRadius: '16px',
    color: 'var(--color-text-body)' as const,
    fontFamily: 'var(--font-sans)',
    fontSize: '13.5px',
    fontWeight: '500',
    boxShadow: '0 8px 32px rgba(44,36,32,0.10), inset 0 1px 0 rgba(255,255,255,0.88)',
    padding: '13px 16px',
    maxWidth: '340px',
  };

  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: 16, right: 16, zIndex: 9999 }}
      gutter={8}
      toastOptions={{
        duration: 3200,
        style: glassBase,
        success: {
          iconTheme: {
            primary: 'var(--color-sage)',
            secondary: 'var(--color-sage-light)',
          },
          style: {
            ...glassBase,
            borderLeft: '3px solid var(--color-sage)',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC503C',
            secondary: 'rgba(220,80,60,0.12)',
          },
          style: {
            ...glassBase,
            borderLeft: '3px solid #DC503C',
          },
        },
        custom: {
          style: {
            ...glassBase,
            borderLeft: '3px solid var(--color-accent)',
          },
        },
      }}
    />
  );
}
