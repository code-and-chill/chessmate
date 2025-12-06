import React from 'react';

// AnimatedBlock deprecated: animations should be handled by DLS primitives.
// For now, this no-op wrapper preserves backward compatibility and simply
// returns children without applying entrance animations.
type Props = {
  children?: React.ReactNode;
};

export default function AnimatedBlock({ children }: Props) {
  return <>{children}</> as any;
}
