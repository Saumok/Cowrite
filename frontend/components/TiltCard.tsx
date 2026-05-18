'use client';

import React, { useRef, useEffect, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TiltCard({
  children,
  className = '',
  style = {},
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Adjust the divisor for stronger/weaker tilt
      const rotateY = ((x - centerX) / centerX) * 8;
      const rotateX = ((y - centerY) / centerY) * -8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeaveInner = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeaveInner);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeaveInner);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transition: style.transition || 'transform 0.1s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
