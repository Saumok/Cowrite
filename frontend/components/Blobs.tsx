export function Blobs({ variant = 'default' }: { variant?: 'default' | 'dashboard' }) {
  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      {variant === 'dashboard' && <div className="blob blob-3" />}
    </>
  );
}
