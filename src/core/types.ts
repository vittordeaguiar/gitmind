export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
  isBreakingChange?: boolean;
}

export interface IAIService {
  generateCommitMessage(diff: string): Promise<CommitMessage>;
}

export interface GitService {
  getStagedDiff(): Promise<string>;
  commit(message: CommitMessage): Promise<void>;
  push(): Promise<void>;
}
