import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { GitServiceImpl } from "../services/git.service.js";
import { AIServiceImpl } from "../services/ai.service.js";
import { getConfig, hasValidConfig } from "../utils/config.js";
import { CommitMessage } from "../core/types.js";

export const genCommand = new Command("gen")
  .description("Gera uma sugestão de commit baseada no staged diff")
  .action(async () => {
    try {
      if (!hasValidConfig()) {
        console.log(chalk.yellow("Configuração não encontrada ou incompleta."));
        console.log(
          chalk.cyan('Por favor, execute "gitmind config" primeiro para configurar sua API Key.')
        );
        return;
      }

      const config = getConfig();
      const gitService = new GitServiceImpl();
      const aiService = new AIServiceImpl(config);

      console.log(chalk.dim("🔍 Analisando mudanças staged..."));
      const diff = await gitService.getStagedDiff();

      if (!diff || diff.trim().length === 0) {
        console.log(chalk.yellow("Nenhuma mudança staged encontrada."));
        console.log('Use "git add <arquivos>" antes de rodar este comando.');
        return;
      }

      console.log(chalk.blue("GitMind está pensando..."));
      let commitMessage: CommitMessage;
      try {
        commitMessage = await aiService.generateCommitMessage(diff);
      } catch (aiError: any) {
        console.error(chalk.red(`Erro na IA: ${aiError.message}`));
        return;
      }

      console.log(chalk.green("Sugestão gerada:"));
      console.log(chalk.bold("--------------------------------------------------"));
      console.log(
        chalk.whiteBright(
          `${commitMessage.type}${commitMessage.scope ? `(${commitMessage.scope})` : ""}: ${
            commitMessage.subject
          }`
        )
      );
      if (commitMessage.body) console.log(chalk.dim(`\n${commitMessage.body}`));
      if (commitMessage.footer) console.log(chalk.dim(`\n${commitMessage.footer}`));
      console.log(chalk.bold("--------------------------------------------------\n"));

      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "O que deseja fazer?",
          choices: [
            { name: "Confirmar e Commitar", value: "commit" },
            { name: "Editar Mensagem", value: "edit" },
            { name: "Gerar Novamente (Ainda não implementado.)", value: "regenerate" },
            { name: "Cancelar", value: "cancel" },
          ],
        },
      ]);

      if (action === "cancel") {
        console.log(chalk.yellow("Operação cancelada."));
        return;
      }

      if (action === "edit") {
        const { type, scope, subject, body, footer } = await inquirer.prompt([
          { type: "input", name: "type", message: "Type:", default: commitMessage.type },
          { type: "input", name: "scope", message: "Scope:", default: commitMessage.scope },
          { type: "input", name: "subject", message: "Subject:", default: commitMessage.subject },
          {
            type: "editor",
            name: "body",
            message: "Body (enter para abrir editor):",
            default: commitMessage.body,
          },
          { type: "input", name: "footer", message: "Footer:", default: commitMessage.footer },
        ]);

        commitMessage = {
          type,
          scope,
          subject,
          body: body.trim(),
          footer: footer.trim(),
          isBreakingChange: commitMessage.isBreakingChange,
        };
      }

      if (action === "commit" || action === "edit") {
        await gitService.commit(commitMessage);

        const { shouldPush } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldPush",
            message: "Deseja fazer push das suas mudanças agora?",
            default: true,
          },
        ]);

        if (shouldPush) {
          await gitService.push();
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`Ocorreu um erro inesperado: ${error.message}`));
    }
  });
