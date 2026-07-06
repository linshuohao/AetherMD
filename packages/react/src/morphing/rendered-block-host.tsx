import { useEffect, useRef } from "react";

import type { AetherBlock, CustomBlockRenderer } from "@aether-md/core";

export interface RenderedBlockHostProps {
  block: AetherBlock;
  renderer: CustomBlockRenderer;
  onFocus: () => void;
}

export function RenderedBlockHost({ block, renderer, onFocus }: RenderedBlockHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    renderer.mount(container, block);
    return () => {
      renderer.unmount?.();
      container.replaceChildren();
    };
  }, [block, renderer]);

  return (
    <div
      ref={containerRef}
      data-testid="morphing-rendered"
      className="aether-morphing-rendered"
      tabIndex={0}
      onFocus={onFocus}
      onMouseDown={(event) => {
        event.preventDefault();
        onFocus();
      }}
    />
  );
}
