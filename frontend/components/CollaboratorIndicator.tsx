import { Collaborator } from '@/types';

const colors = [
  'var(--blob-orange)',
  'var(--blob-blush)',
  'var(--blob-sage)',
  'var(--blob-sky)',
];

const getUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function CollaboratorIndicator({
  collaborators,
}: {
  collaborators: Collaborator[];
}) {
  if (collaborators.length === 0) return null;

  return (
    <div className="flex -space-x-2 items-center select-none">
      {collaborators.slice(0, 4).map((c) => (
        <div
          key={c.userId}
          title={c.userName}
          style={{ backgroundColor: c.color || getUserColor(c.userId) }}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center
                     text-[11px] font-sans font-bold text-white uppercase shadow-[var(--shadow-soft)]"
        >
          {c.userName[0]}
        </div>
      ))}
      {collaborators.length > 4 && (
        <div
          className="w-7 h-7 rounded-full border-2 border-white bg-[var(--color-elevated)]
                     flex items-center justify-center text-[10px] font-sans font-bold text-[var(--color-text-secondary)] shadow-[var(--shadow-soft)]"
          title={`${collaborators.length - 4} more active collaborators`}
        >
          +{collaborators.length - 4}
        </div>
      )}
    </div>
  );
}
