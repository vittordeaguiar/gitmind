import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from 'ollama-ai-provider';
import { IAIService, CommitMessage } from "../core/types.js";
import { SYSTEM_PROMPT } from "../core/prompt.js";

export enum AIProvider {
  OpenAI = "openai",
  Google = "google",
  Anthropic = "anthropic",
  Ollama = "ollama",
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export class AIServiceImpl implements IAIService {
  private config: AIConfig;
  private aiClient: ReturnType<
    typeof createOpenAI | typeof createGoogleGenerativeAI | typeof createAnthropic | typeof createOllama
  >;

  constructor(config: AIConfig) {
    this.config = config;
    this.aiClient = this.initializeAIClient(config);
  }

  private initializeAIClient(config: AIConfig) {
    switch (config.provider) {
      case AIProvider.OpenAI:
        return createOpenAI({ apiKey: config.apiKey });
      case AIProvider.Google:
        return createGoogleGenerativeAI({ apiKey: config.apiKey });
      case AIProvider.Anthropic:
        return createAnthropic({ apiKey: config.apiKey });
      case AIProvider.Ollama:
        return createOllama({ baseURL: config.apiKey.startsWith('http') ? config.apiKey : undefined });
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  async generateCommitMessage(diff: string): Promise<CommitMessage> {
    try {
      const result = await generateText({
        model: (this.aiClient as any)(this.config.model),
        system: SYSTEM_PROMPT,
        prompt: `Analise o seguinte diff e gere uma mensagem de commit:\n\n${diff}`,
      });

      const commitMessageRaw = result.text.trim();

      // TODO: Implementar a lógica de parsing para CommitMessage
      return this.parseCommitMessage(commitMessageRaw);
    } catch (error: any) {
      console.error("Error generating commit message with AI:", error.message);
      throw new Error(`Failed to generate commit message: ${error.message}`);
    }
  }

  private parseCommitMessage(rawMessage: string): CommitMessage {
    const lines = rawMessage
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const firstLine = lines.shift() || "";

    const headerMatch = firstLine.match(
      /^(?<type>[a-z]+)(\((?<scope>[a-zA-Z0-9_-]+)\))?(?<breaking>!)?: (?<subject>.+)$/
    );

    if (!headerMatch || !headerMatch.groups) {
      console.warn("Could not parse AI generated commit message header. Using raw subject.");
      return {
        type: "chore",
        subject: firstLine,
        body: lines.join("\n") || undefined,
      };
    }

    const { type, scope, subject, breaking } = headerMatch.groups;

    let body: string | undefined;
    let footer: string | undefined;
    let isBreakingChange = !!breaking;

    const bodyAndFooter = lines.join("\n");
    const breakingChangeMarker = "BREAKING CHANGE:";
    const breakingChangeIndex = bodyAndFooter.indexOf(breakingChangeMarker);

    if (breakingChangeIndex !== -1) {
      body = bodyAndFooter.substring(0, breakingChangeIndex).trim() || undefined;
      footer = bodyAndFooter.substring(breakingChangeIndex).trim() || undefined;
      isBreakingChange = true;
    } else if (bodyAndFooter.startsWith("Refs #") || bodyAndFooter.startsWith("Closes #")) {
      footer = bodyAndFooter;
    } else {
      body = bodyAndFooter || undefined;
    }

    return {
      type: type || "chore",
      scope: scope || undefined,
      subject: subject,
      body: body,
      footer: footer,
      isBreakingChange: isBreakingChange,
    };
  }
}
