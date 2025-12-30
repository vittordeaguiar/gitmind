import { simpleGit, SimpleGit } from "simple-git";
import chalk from "chalk";
import { CommitMessage, GitService } from "../core/types.js";

export class GitServiceImpl implements GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getStagedDiff(): Promise<string> {
    try {
      const diff = await this.git.diff(["--staged"]);
      if (!diff) {
        throw new Error(
          "No staged changes found. Please stage your changes before generating a commit message."
        );
      }
      return diff;
    } catch (error: any) {
      // TODO: Melhorar o tratamento de erro
      console.error("Error getting staged diff:", error.message);
      throw new Error(`Failed to get staged changes: ${error.message}`);
    }
  }

  async getBranchName(): Promise<string> {
    try {
      const branchSummary = await this.git.branchLocal();
      return branchSummary.current;
    } catch (error: any) {
      console.warn("Could not determine branch name:", error.message);
      return "";
    }
  }

  async commit(message: CommitMessage): Promise<void> {
    try {
      let header = `${message.type}${message.scope ? "(" + message.scope + ")" : ""}`;
      if (message.isBreakingChange) {
        header += "!";
      }
      header += `: ${message.subject}`;

      let commitMsg = header;

      if (message.body && message.body.trim().length > 0) {
        commitMsg += `\n\n${message.body.trim()}`;
      }

      if (message.footer && message.footer.trim().length > 0) {
        if (commitMsg.endsWith("\n")) {
          commitMsg += `\n${message.footer.trim()}`;
        } else {
          commitMsg += `\n\n${message.footer.trim()}`;
        }
      }

      await this.git.commit(commitMsg);
      console.log("Commit realizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao realizar commit:", error.message);
      throw new Error(`Falha ao realizar commit: ${error.message}`);
    }
  }

  async push(): Promise<void> {
    try {
      await this.git.push();
      console.log(chalk.green("Push realizado com sucesso!"));
    } catch (error: any) {
      console.error(chalk.red("Erro ao realizar push:", error.message));
      throw new Error(`Falha ao realizar push: ${error.message}`);
    }
  }
}
