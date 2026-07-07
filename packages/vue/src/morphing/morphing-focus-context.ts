import {
  defineComponent,
  inject,
  provide,
  ref,
  type InjectionKey,
  type Ref,
  type VNode,
} from "vue";

type FocusCommitHandler = () => Promise<void>;

export interface MorphingFocusContextValue {
  focusedBlockId: Ref<string | null>;
  requestFocus: (blockId: string) => void;
  releaseFocus: () => void;
  registerFocusCommit: (blockId: string, handler: FocusCommitHandler) => () => void;
}

const MorphingFocusKey: InjectionKey<MorphingFocusContextValue> = Symbol("MorphingFocus");

export function useMorphingFocus(): MorphingFocusContextValue | null {
  return inject(MorphingFocusKey, null);
}

export const MorphingFocusProvider = defineComponent({
  name: "MorphingFocusProvider",
  setup(_, { slots }) {
    const focusedBlockId = ref<string | null>(null);
    const focusedBlockIdRef = ref<string | null>(null);
    const commitHandlers = new Map<string, FocusCommitHandler>();
    let focusTransition = Promise.resolve();

    const runCommitForBlock = async (blockId: string): Promise<void> => {
      const commit = commitHandlers.get(blockId);
      if (commit) {
        await commit();
      }
    };

    const enqueueFocusTransition = (transition: () => Promise<void>): void => {
      focusTransition = focusTransition.then(transition);
    };

    const requestFocus = (blockId: string): void => {
      if (focusedBlockIdRef.value === blockId) {
        return;
      }
      enqueueFocusTransition(async () => {
        const current = focusedBlockIdRef.value;
        if (current !== null && current !== blockId) {
          await runCommitForBlock(current);
        }
        focusedBlockIdRef.value = blockId;
        focusedBlockId.value = blockId;
      });
    };

    const releaseFocus = (): void => {
      enqueueFocusTransition(async () => {
        const current = focusedBlockIdRef.value;
        if (current !== null) {
          await runCommitForBlock(current);
        }
        focusedBlockIdRef.value = null;
        focusedBlockId.value = null;
      });
    };

    const registerFocusCommit = (blockId: string, handler: FocusCommitHandler): (() => void) => {
      commitHandlers.set(blockId, handler);
      return () => {
        if (commitHandlers.get(blockId) === handler) {
          commitHandlers.delete(blockId);
        }
      };
    };

    provide(MorphingFocusKey, {
      focusedBlockId,
      requestFocus,
      releaseFocus,
      registerFocusCommit,
    });

    return (): VNode | VNode[] | null | undefined => slots.default?.() ?? null;
  },
});
