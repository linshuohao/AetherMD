import { createContext, useContext, useState, type ReactNode } from "react";

export interface MorphingFocusContextValue {
  focusedBlockId: string | null;
  setFocusedBlockId: (blockId: string | null) => void;
}

const MorphingFocusContext = createContext<MorphingFocusContextValue | null>(null);

export function MorphingFocusProvider({ children }: { children: ReactNode }) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  return (
    <MorphingFocusContext.Provider value={{ focusedBlockId, setFocusedBlockId }}>
      {children}
    </MorphingFocusContext.Provider>
  );
}

export function useMorphingFocus(): MorphingFocusContextValue | null {
  return useContext(MorphingFocusContext);
}
