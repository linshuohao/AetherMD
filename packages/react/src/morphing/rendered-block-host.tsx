import { useEffect, useRef, useState } from "react";

import type { AetherBlock } from "@aether-md/core";
import { RenderError } from "@aether-md/core";

import type { CustomBlockRenderer } from "./contracts.js";
import { RenderFallbackView } from "./render-fallback-view.js";

export interface RenderedBlockHostProps {
  block: AetherBlock;
  renderer: CustomBlockRenderer;
  onFocus: () => void;
}

export function RenderedBlockHost({ block, renderer, onFocus }: RenderedBlockHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedIdentityRef = useRef<{ blockId: string | undefined; blockType: string } | null>(
    null,
  );
  const [renderError, setRenderError] = useState<RenderError | null>(null);

  const blockId = block.id;
  const blockType = block.type;

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (!container) {
        return;
      }
      try {
        renderer.unmount?.();
      } catch {
        // Best-effort cleanup after a failed mount should not mask the original error.
      }
      container.replaceChildren();
      mountedIdentityRef.current = null;
    };
  }, [blockId, blockType, renderer]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const mounted = mountedIdentityRef.current;
    const isMounted =
      mounted !== null && mounted.blockId === blockId && mounted.blockType === blockType;

    const mountBlock = () => {
      setRenderError(null);
      try {
        renderer.mount(container, block);
        mountedIdentityRef.current = { blockId, blockType };
      } catch (cause) {
        mountedIdentityRef.current = null;
        setRenderError(
          new RenderError({
            code: "RENDER_MOUNT_FAILED",
            message: cause instanceof Error ? cause.message : "Block renderer mount failed",
            cause,
          }),
        );
      }
    };

    if (!isMounted) {
      mountBlock();
      return;
    }

    if (renderer.update) {
      setRenderError(null);
      try {
        renderer.update(block);
      } catch (cause) {
        setRenderError(
          new RenderError({
            code: "RENDER_UPDATE_FAILED",
            message: cause instanceof Error ? cause.message : "Block renderer update failed",
            cause,
          }),
        );
      }
      return;
    }

    try {
      renderer.unmount?.();
    } catch {
      // Best-effort cleanup before remount.
    }
    container.replaceChildren();
    mountBlock();
  }, [block, blockId, blockType, renderer]);

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
