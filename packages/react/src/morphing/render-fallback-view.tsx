import type { RenderError } from "@aether-md/core";

export interface RenderFallbackViewProps {
  error: RenderError;
  onFocus: () => void;
}

export function RenderFallbackView({ error, onFocus }: RenderFallbackViewProps) {
  return (
    <div
      data-testid="morphing-render-fallback"
      className="aether-render-fallback"
      role="alert"
      tabIndex={0}
      onFocus={onFocus}
      onMouseDown={(event) => {
        event.preventDefault();
        onFocus();
      }}
    >
      <span data-testid="morphing-render-fallback-message">{error.message}</span>
    </div>
  );
}
