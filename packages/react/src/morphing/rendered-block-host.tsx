import { useEffect, useRef, useState } from "react";

import { RenderError, type AetherBlock, type CustomBlockRenderer } from "@aether-md/core";

import { RenderFallbackView } from "./render-fallback-view.js";

export interface RenderedBlockHostProps {
  block: AetherBlock;
  renderer: CustomBlockRenderer;
  onFocus: () => void;
}

export function RenderedBlockHost({ block, renderer, onFocus }: RenderedBlockHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<RenderError | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    setRenderError(null);

    try {
      renderer.mount(container, block);
    } catch (cause) {
      setRenderError(
        new RenderError({
          code: "RENDER_MOUNT_FAILED",
          message: cause instanceof Error ? cause.message : "Block renderer mount failed",
          cause,
        }),
      );
      return;
    }

    return () => {
      try {
        renderer.unmount?.();
      } catch {
        // Best-effort cleanup after a failed mount should not mask the original error.
      }
      container.replaceChildren();
    };
  }, [block, renderer]);

  if (renderError) {
    return <RenderFallbackView error={renderError} onFocus={onFocus} />;
  }

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
