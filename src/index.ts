import { Command } from "commander";
import { genCommand } from "./commands/gen.js";
import { configCommand } from "./commands/config.js"; // Será implementado no próximo passo

const program = new Command();

program
  .name("gitmind")
  .description("IA para gerar mensagens de commit inteligentes")
  .version("1.0.0");

program.addCommand(genCommand);
program.addCommand(configCommand);

program.parse();
