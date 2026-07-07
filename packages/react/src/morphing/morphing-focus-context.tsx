import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type FocusCommitHandler = () => Promise<void>;

export interface MorphingFocusContextValue {
  focusedBlockId: string | null;
  requestFocus: (blockId: string) => void;
  releaseFocus: () => void;
  registerFocusCommit: (blockId: string, handler: FocusCommitHandler) => () => void;
}

const MorphingFocusContext = createContext<MorphingFocusContextValue | null>(null);

export function MorphingFocusProvider({ children }: { children: ReactNode }) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const focusedBlockIdRef = useRef<string | null>(null);
  const commitHandlersRef = useRef(new Map<string, FocusCommitHandler>());
  const focusTransitionRef = useRef<Promise<void>>(Promise.resolve());

  const runCommitForBlock = useCallback(async (blockId: string) => {
    const commit = commitHandlersRef.current.get(blockId);
    if (commit) {
      await commit();
    }
  }, []);

  const enqueueFocusTransition = useCallback((transition: () => Promise<void>) => {
    focusTransitionRef.current = focusTransitionRef.current.then(transition);
  }, []);

  const requestFocus = useCallback(
    (blockId: string) => {
      if (focusedBlockIdRef.current === blockId) {
        return;
      }
      enqueueFocusTransition(async () => {
        const current = focusedBlockIdRef.current;
        if (current !== null && current !== blockId) {
          await runCommitForBlock(current);
        }
        focusedBlockIdRef.current = blockId;
        setFocusedBlockId(blockId);
      });
    },
    [enqueueFocusTransition, runCommitForBlock],
  );

  const releaseFocus = useCallback(() => {
    enqueueFocusTransition(async () => {
      const current = focusedBlockIdRef.current;
      if (current !== null) {
        await runCommitForBlock(current);
      }
      focusedBlockIdRef.current = null;
      setFocusedBlockId(null);
    });
  }, [enqueueFocusTransition, runCommitForBlock]);

  const registerFocusCommit = useCallback((blockId: string, handler: FocusCommitHandler) => {
    commitHandlersRef.current.set(blockId, handler);
    return () => {
      if (commitHandlersRef.current.get(blockId) === handler) {
        commitHandlersRef.current.delete(blockId);
      }
    };
  }, []);

  return (
    <MorphingFocusContext.Provider
      value={{ focusedBlockId, requestFocus, releaseFocus, registerFocusCommit }}
    >
      {children}
    </MorphingFocusContext.Provider>
  );
}

export function useMorphingFocus(): MorphingFocusContextValue | null {
  return useContext(MorphingFocusContext);
}
