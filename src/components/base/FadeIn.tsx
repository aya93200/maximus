import { useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  className = '',
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClass = direction === 'up'
    ? 'translate-y-3'
    : direction === 'down'
      ? '-translate-y-3'
      : direction === 'left'
        ? 'translate-x-3'
        : direction === 'right'
          ? '-translate-x-3'
          : '';

  return (
    <div
      className={`
        transition-all will-change-transform
        ${directionClass}
        ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0'}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}