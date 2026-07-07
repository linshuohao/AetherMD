import type { CommandRequest } from "./types.js";

export type CommandPriority = "p0" | "p1" | "p2" | "p3";

const PRIORITY_ORDER: Record<CommandPriority, number> = {
  p0: 0,
  p1: 1,
  p2: 2,
  p3: 3,
};

export function resolveCommandPriority(command: CommandRequest): CommandPriority {
  const priority = command.meta?.priority;
  if (priority === "p0" || priority === "p1" || priority === "p2" || priority === "p3") {
    return priority;
  }
  if (priority === "high") {
    return "p1";
  }
  if (command.id === "core:undo" || command.id === "core:redo") {
    return "p0";
  }
  return "p2";
}

export function compareCommandPriority(a: CommandRequest, b: CommandRequest): number {
  return PRIORITY_ORDER[resolveCommandPriority(a)] - PRIORITY_ORDER[resolveCommandPriority(b)];
}

export interface QueuedCommand {
  command: CommandRequest;
  sequence: number;
}

export function sortCommandsByPriority(items: readonly QueuedCommand[]): QueuedCommand[] {
  return [...items].sort((left, right) => {
    const byPriority = compareCommandPriority(left.command, right.command);
    if (byPriority !== 0) {
      return byPriority;
    }
    return left.sequence - right.sequence;
  });
}

export class CommandPriorityQueue {
  private items: QueuedCommand[] = [];
  private sequence = 0;

  enqueue(command: CommandRequest): void {
    this.items.push({ command, sequence: this.sequence++ });
  }

  drainSorted(): CommandRequest[] {
    const sorted = sortCommandsByPriority(this.items);
    this.items = [];
    return sorted.map((item) => item.command);
  }

  get size(): number {
    return this.items.length;
  }
}
