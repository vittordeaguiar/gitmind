import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { GitServiceImpl } from "../services/git.service.js";
import { AIServiceImpl } from "../services/ai.service.js";
import { getConfig, hasValidConfig } from "../utils/config.js";
import { CommitMessage } from "../core/types.js";

export const genCommand = new Command("gen")
  .description("Gera uma sugestão de commit baseada no staged diff")
  .action(async () => {
    const spinner = ora();
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

      spinner.start("Analisando mudanças staged...");
      const diff = await gitService.getStagedDiff();
      const branchName = await gitService.getBranchName();

      if (!diff || diff.trim().length === 0) {
        spinner.fail("Nenhuma mudança staged encontrada.");
        console.log('Use "git add <arquivos>" antes de rodar este comando.');
        return;
      }
      spinner.succeed("Mudanças analisadas.");

      while (true) {
        spinner.start("GitMind está pensando...");
        let commitMessage: CommitMessage;
        try {
          commitMessage = await aiService.generateCommitMessage(diff, branchName);
          spinner.succeed("Sugestão gerada!");
        } catch (aiError: any) {
          spinner.fail(`Erro na IA: ${aiError.message}`);
          return;
        }

        console.log(chalk.bold("\n--------------------------------------------------"));
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
              { name: "Gerar Novamente", value: "regenerate" },
              { name: "Cancelar", value: "cancel" },
            ],
          },
        ]);

        if (action === "regenerate") {
          continue;
        }

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
            spinner.start("Realizando push...");
            try {
              await gitService.push();
              spinner.succeed("Push realizado com sucesso!");
            } catch (error: any) {
              spinner.fail(`Erro ao realizar push: ${error.message}`);
            }
          }
          break;
        }
      }
    } catch (error: any) {
      spinner.stop();
      console.error(chalk.red(`Ocorreu um erro inesperado: ${error.message}`));
    }
  });
