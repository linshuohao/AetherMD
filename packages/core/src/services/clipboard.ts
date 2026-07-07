export interface ClipboardService {
  copy(text: string): void;
  read(): string;
  paste(): string;
  clear(): void;
}

export function createClipboardService(): ClipboardService {
  let buffer = "";

  return {
    copy(text: string) {
      buffer = text;
    },
    read() {
      return buffer;
    },
    paste() {
      return buffer;
    },
    clear() {
      buffer = "";
    },
  };
}
