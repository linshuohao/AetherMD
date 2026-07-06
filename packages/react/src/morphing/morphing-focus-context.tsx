import { createContext, useContext, useState, type ReactNode } from "react";

export interface MorphingFocusContextValue {
  focusedBlockIndex: number | null;
  setFocusedBlockIndex: (index: number | null) => void;
}

const MorphingFocusContext = createContext<MorphingFocusContextValue | null>(
  null,
);

export function MorphingFocusProvider({ children }: { children: ReactNode }) {
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(
    null,
  );

  return (
    <MorphingFocusContext.Provider
      value={{ focusedBlockIndex, setFocusedBlockIndex }}
    >
      {children}
    </MorphingFocusContext.Provider>
  );
}

export function useMorphingFocus(): MorphingFocusContextValue | null {
  return useContext(MorphingFocusContext);
}
