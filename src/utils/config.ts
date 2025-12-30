// src/utils/config.ts
import Conf from 'conf';
import { AIConfig, AIProvider } from '../services/ai.service.js';

// Schema para validação básica (opcional com TS, mas bom para runtime)
interface GitMindSchema {
    provider: AIProvider;
    apiKey: string;
    model: string;
}

const config = new Conf<GitMindSchema>({ 
    projectName: 'gitmind',
    defaults: {
        provider: AIProvider.OpenAI,
        apiKey: '',
        model: 'gpt-4o' // Default sensato
    }
});

export const getConfig = (): AIConfig => {
    return {
        provider: config.get('provider') as AIProvider,
        apiKey: config.get('apiKey') as string,
        model: config.get('model') as string
    };
};

export const setConfig = (key: keyof GitMindSchema, value: string) => {
    config.set(key, value);
};

export const hasValidConfig = (): boolean => {
    const key = config.get('apiKey');
    return !!key && key.length > 0;
};

export const clearConfig = () => {
    config.clear();
};
