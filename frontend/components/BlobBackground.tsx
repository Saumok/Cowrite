export function BlobBackground() {
  return (
    <div className="blob-container" 
         aria-hidden="true" 
         style={{ position: 'fixed', inset: 0, 
                  zIndex: 0, pointerEvents: 'none', 
                  overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'var(--blob-orange)',
        filter: 'blur(100px)',
        opacity: 0.28,
        top: '-150px', right: '-100px',
        animation: 'blobDrift 70s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'var(--blob-blush)',
        filter: 'blur(90px)',
        opacity: 0.25,
        bottom: '-120px', left: '-80px',
        animation: 'blobDrift 85s ease-in-out infinite alternate-reverse',
      }} />
      <div style={{
        position: 'absolute',
        width: '350px', height: '350px',
        borderRadius: '50%',
        background: 'var(--blob-sage)',
        filter: 'blur(80px)',
        opacity: 0.18,
        top: '45%', left: '30%',
        animation: 'blobDrift 100s ease-in-out infinite alternate',
      }} />
    </div>
  )
}
