export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string;
  model?: string;
}

export interface LLMProvider {
  id: string;
  generateCompletion(messages: Message[], options?: CompletionOptions): Promise<string>;
  generateStream(messages: Message[], options?: CompletionOptions): AsyncGenerator<string>;
  countTokens(text: string): number;
}
