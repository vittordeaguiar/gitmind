import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { setConfig, getConfig, clearConfig } from "../utils/config.js";
import { AIProvider } from "../services/ai.service.js";

export const configCommand = new Command("config")
  .description("Configura as chaves de API e o provedor preferido")
  .option(
    "-p, --provider <provider>",
    "Define o provedor de IA (openai, google, anthropic, ollama)"
  )
  .option("-k, --api-key <key>", "Define a chave de API para o provedor de IA")
  .option("-m, --model <model>", "Define o modelo de IA a ser usado (ex: gpt-4o, gemini-pro)")
  .option("--clear", "Limpa todas as configurações salvas")
  .action(async (options) => {
    if (options.clear) {
      clearConfig();
      console.log(chalk.green("Todas as configurações foram limpas."));
      return;
    }

    let currentConfig = getConfig();
    let configChanged = false;

    if (!options.provider && !options.apiKey && !options.model) {
      console.log(chalk.bold("Configurações Atuais:"));
      console.log(`  Provedor: ${chalk.cyan(currentConfig.provider || "Não configurado")}`);
      console.log(
        `  API Key: ${chalk.cyan(
          currentConfig.apiKey ? "********" + currentConfig.apiKey.slice(-4) : "Não configurada"
        )}`
      );
      console.log(`  Modelo: ${chalk.cyan(currentConfig.model || "Não configurado")}`);
      console.log('\nUse "gitmind config --help" para ver as opções de configuração.');
      return;
    }

    if (options.provider && !Object.values(AIProvider).includes(options.provider as AIProvider)) {
      console.log(
        chalk.red(
          `Provedor inválido: "${options.provider}". Escolha entre: ${Object.values(
            AIProvider
          ).join(", ")}`
        )
      );
      return;
    }

    let provider = options.provider || currentConfig.provider;
    if (!provider) {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Qual provedor de IA você gostaria de usar?",
          choices: Object.values(AIProvider),
          default: currentConfig.provider || AIProvider.OpenAI,
        },
      ]);
      provider = answers.provider;
    }
    if (provider && provider !== currentConfig.provider) {
      setConfig("provider", provider);
      configChanged = true;
    }

    let apiKey = options.apiKey || currentConfig.apiKey;
    if (!apiKey) {
      const answers = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: `Digite sua API Key para ${provider}:
`,
          mask: "*",
        },
      ]);
      apiKey = answers.apiKey;
    }
    if (apiKey && apiKey !== currentConfig.apiKey) {
      setConfig("apiKey", apiKey);
      configChanged = true;
    }

    let model = options.model || currentConfig.model;
    if (!model) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "model",
          message: `Qual modelo você gostaria de usar para ${provider}? (ex: gpt-4o, gemini-pro)
`,
          default: currentConfig.model || "gpt-4o",
        },
      ]);
      model = answers.model;
    }
    if (model && model !== currentConfig.model) {
      setConfig("model", model);
      configChanged = true;
    }

    if (configChanged) {
      console.log(chalk.green("Configurações salvas com sucesso!"));
    } else {
      console.log(chalk.blue("Nenhuma alteração nas configurações."));
    }

    currentConfig = getConfig();
    console.log(chalk.bold("Configurações Finais:"));
    console.log(`  Provedor: ${chalk.cyan(currentConfig.provider || "Não configurado")}`);
    console.log(
      `  API Key: ${chalk.cyan(
        currentConfig.apiKey ? "********" + currentConfig.apiKey.slice(-4) : "Não configurada"
      )}`
    );
    console.log(`  Modelo: ${chalk.cyan(currentConfig.model || "Não configurado")}`);
  });
