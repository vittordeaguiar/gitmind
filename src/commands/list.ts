import { Command } from "commander";
import chalk from "chalk";
import { getConfig, hasValidConfig } from "../utils/config.js";

export const listCommand = new Command("list")
  .description("Lista as configurações atuais do GitMind")
  .action(() => {
    if (!hasValidConfig()) {
      console.log(chalk.yellow("Nenhuma configuração encontrada."));
      console.log(chalk.cyan('Execute "gitmind config" para configurar sua ferramenta.'));
      return;
    }

    const config = getConfig();

    const maskedKey = config.apiKey ? `...${config.apiKey.slice(-4)}` : chalk.red("Não definida");

    console.log(chalk.bold("\nConfiguração Atual do GitMind:"));
    console.log(chalk.dim("------------------------------"));
    console.log(`${chalk.bold("Provider:")} ${chalk.green(config.provider)}`);
    console.log(`${chalk.bold("Model:")}    ${chalk.cyan(config.model)}`);
    console.log(`${chalk.bold("API Key:")}  ${maskedKey}`);
    console.log(chalk.dim("------------------------------\n"));
  });
