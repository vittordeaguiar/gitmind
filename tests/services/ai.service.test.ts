import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIServiceImpl, AIProvider } from '../../src/services/ai.service';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';

vi.mock('ai');
vi.mock('@ai-sdk/openai');
vi.mock('@ai-sdk/google');
vi.mock('@ai-sdk/anthropic');
vi.mock('ollama-ai-provider');

describe('AIService', () => {
  let aiService: AIServiceImpl;
  const mockConfig = {
    provider: AIProvider.OpenAI,
    apiKey: 'test-key',
    model: 'gpt-4o',
  };

  const mockModelObject = { id: 'mock-model-obj' };
  const mockProviderInstance = vi.fn().mockReturnValue(mockModelObject);

  beforeEach(() => {
    vi.clearAllMocks();
    (createOpenAI as any).mockReturnValue(mockProviderInstance);
    (createOllama as any).mockReturnValue(mockProviderInstance);
    (generateText as any).mockResolvedValue({ text: 'feat(test): test commit' });
  });

  it('should initialize with OpenAI provider', () => {
    new AIServiceImpl(mockConfig);
    expect(createOpenAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
  });

  it('should initialize with Ollama provider', () => {
    new AIServiceImpl({ ...mockConfig, provider: AIProvider.Ollama, apiKey: 'http://localhost:11434' });
    expect(createOllama).toHaveBeenCalledWith({ baseURL: 'http://localhost:11434' });
  });
  
  it('should use default Ollama URL if apiKey is not a URL', () => {
      new AIServiceImpl({ ...mockConfig, provider: AIProvider.Ollama, apiKey: 'ollama' });
      expect(createOllama).toHaveBeenCalledWith({ baseURL: undefined });
  });

  it('should generate and parse commit message', async () => {
    aiService = new AIServiceImpl(mockConfig);
    const diff = 'diff content';
    const branch = 'feature/test';

    const result = await aiService.generateCommitMessage(diff, branch);

    expect(mockProviderInstance).toHaveBeenCalledWith('gpt-4o');
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockModelObject,
      prompt: expect.stringContaining(`Branch atual: ${branch}`),
    }));
    expect(result).toEqual({
      type: 'feat',
      scope: 'test',
      subject: 'test commit',
      body: undefined,
      footer: undefined,
      isBreakingChange: false,
    });
  });

  it('should parse breaking changes', async () => {
    (generateText as any).mockResolvedValue({ text: 'feat!: breaking change\n\nBREAKING CHANGE: something broke' });
    aiService = new AIServiceImpl(mockConfig);
    
    const result = await aiService.generateCommitMessage('diff');

    expect(result.isBreakingChange).toBe(true);
    expect(result.type).toBe('feat');
    expect(result.subject).toBe('breaking change');
    expect(result.footer).toBe('BREAKING CHANGE: something broke');
  });
});
