'use client';

import { useEffect } from 'react';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';

export function ToastConfig() {
  const { toasts } = useToasterStore();

  // Programmatically limit active toasts to maximum 3
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .slice(3)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 16,
        right: 16,
        zIndex: 9999,
      }}
      gutter={10}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(250, 247, 242, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.70)',
          borderRadius: '14px',
          color: 'var(--color-text-body)',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: `
            0 8px 32px rgba(44, 36, 32, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.85)
          `,
          padding: '14px 18px',
          maxWidth: '340px',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-sage)',
            secondary: 'var(--color-sage-light)',
          },
          style: {
            background: 'rgba(250, 247, 242, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.70)',
            borderLeft: '3px solid var(--color-sage)',
            borderRadius: '14px',
            color: 'var(--color-text-body)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: `
              0 8px 32px rgba(44, 36, 32, 0.10),
              inset 0 1px 0 rgba(255, 255, 255, 0.85)
            `,
            padding: '14px 18px',
            maxWidth: '340px',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC503C',
            secondary: 'rgba(220, 80, 60, 0.10)',
          },
          style: {
            background: 'rgba(250, 247, 242, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.70)',
            borderLeft: '3px solid #DC503C',
            borderRadius: '14px',
            color: 'var(--color-text-body)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: `
              0 8px 32px rgba(44, 36, 32, 0.10),
              inset 0 1px 0 rgba(255, 255, 255, 0.85)
            `,
            padding: '14px 18px',
            maxWidth: '340px',
          },
        },
        custom: {
          style: {
            background: 'rgba(250, 247, 242, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.70)',
            borderLeft: '3px solid var(--color-accent)',
            borderRadius: '14px',
            color: 'var(--color-text-body)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: `
              0 8px 32px rgba(44, 36, 32, 0.10),
              inset 0 1px 0 rgba(255, 255, 255, 0.85)
            `,
            padding: '14px 18px',
            maxWidth: '340px',
          },
        },
      }}
    />
  );
}
