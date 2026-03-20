import React from 'react';

export default function TorchEffect() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-y-0 left-0 w-[40vw] pointer-events-none z-[45] overflow-hidden"
    >
      <div className="absolute top-1/2 -left-[20%] -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_0%_50%,rgba(251,191,36,0.18),transparent_70%)] blur-[120px]" />
      <div className="absolute left-0 top-0 w-full h-full bg-[linear-gradient(90deg,rgba(251,191,36,0.03)_0%,transparent_40%)]" />
    </div>
  );
}

