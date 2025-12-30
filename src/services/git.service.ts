import { simpleGit, SimpleGit } from 'simple-git';
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

  async commit(message: CommitMessage): Promise<void> {
    try {
      // Monta a primeira linha (header)
      let header = `${message.type}${message.scope ? '(' + message.scope + ')' : ''}`;
      if (message.isBreakingChange) {
        header += '!'; // Breaking change indicator after type/scope
      }
      header += `: ${message.subject}`;

      let commitMsg = header;

      // Adiciona o corpo (body) se existir, com uma linha em branco antes
      if (message.body && message.body.trim().length > 0) {
        commitMsg += `\n\n${message.body.trim()}`;
      }

      // Adiciona o rodapé (footer) se existir, com uma linha em branco antes
      if (message.footer && message.footer.trim().length > 0) {
        // Se já houver body, a linha em branco já estará lá.
        // Se não houver body, mas houver footer, precisamos de 2 \n\n.
        // Uma forma mais robusta é garantir que haja pelo menos 2 \n no final.
        if (commitMsg.endsWith('\n')) { // Já tem pelo menos uma, precisa de mais uma
          commitMsg += `\n${message.footer.trim()}`;
        } else { // Não tem linha em branco, precisa de duas
          commitMsg += `\n\n${message.footer.trim()}`;
        }
      }

      await this.git.commit(commitMsg);
      console.log('Commit successful!');
    } catch (error: any) {
      console.error('Error committing changes:', error.message);
      throw new Error(`Failed to commit changes: ${error.message}`);
    }
  }
}
