import { SocketStatus } from '@/types';

export function SocketStatusBadge({ status }: { status: SocketStatus }) {
  if (status === 'connected') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--glass-btn-bg)',
          backdropFilter: 'var(--glass-btn-blur)',
          WebkitBackdropFilter: 'var(--glass-btn-blur)',
          border: '1px solid var(--glass-btn-border)',
          borderRadius: '999px',
          padding: '6px 14px',
          boxShadow: 'var(--glass-btn-shadow)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-sage)',
            animation: 'livePulse 3s infinite ease-in-out',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-sage)',
            letterSpacing: '0.03em',
          }}
        >
          READY
        </span>
      </span>
    );
  }

  if (status === 'reconnecting') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--glass-btn-bg)',
          backdropFilter: 'var(--glass-btn-blur)',
          WebkitBackdropFilter: 'var(--glass-btn-blur)',
          border: '1px solid var(--glass-btn-border)',
          borderRadius: '999px',
          padding: '6px 14px',
          boxShadow: 'var(--glass-btn-shadow)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--blob-warm-orange)',
            animation: 'livePulse 1s infinite ease-in-out',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-accent)',
            letterSpacing: '0.03em',
          }}
        >
          SYNCING
        </span>
      </span>
    );
  }

  // Offline / Disconnected
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--glass-btn-bg)',
        backdropFilter: 'var(--glass-btn-blur)',
        WebkitBackdropFilter: 'var(--glass-btn-blur)',
        border: '1px solid var(--glass-btn-border)',
        borderRadius: '999px',
        padding: '6px 14px',
        boxShadow: 'var(--glass-btn-shadow)',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#DC503C',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#DC503C',
          letterSpacing: '0.03em',
        }}
      >
        OFFLINE
      </span>
    </span>
  );
}
