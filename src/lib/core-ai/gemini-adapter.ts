import { generateReplyToMessage } from '@/ai/flows/generate-reply-to-message';
import { summarizeWebpageContent } from '@/ai/flows/summarize-webpage-content';
import { CompletionOptions, LLMProvider, Message } from './interfaces';
import { countTokens } from './tokenizer';

class GeminiAdapter implements LLMProvider {
  id = 'gemini';

  private formatMessages(messages: Message[]): string {
    // Simple formatter for the available Genkit flow
    return messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');
  }

  async generateCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
    const formattedMessage = this.formatMessages(messages);
    try {
      const result = await generateReplyToMessage({ message: formattedMessage });
      return result.reply;
    } catch (error) {
      console.error('Error generating completion with Gemini:', error);
      throw new Error('Failed to get a response from the AI.');
    }
  }

  async *generateStream(messages: Message[], options?: CompletionOptions): AsyncGenerator<string> {
    const reply = await this.generateCompletion(messages, options);
    const words = reply.split(/(\s+)/); // Split by spaces, keeping them
    for (const word of words) {
      yield word;
      await new Promise(resolve => setTimeout(resolve, 30)); // Simulate streaming delay
    }
  }

  countTokens(text: string): number {
    return countTokens(text);
  }

  async summarizeUrl(url: string): Promise<string> {
    try {
      const result = await summarizeWebpageContent({ url });
      return result.summary;
    } catch (error) {
      console.error('Error summarizing URL with Gemini:', error);
      throw new Error('Failed to summarize the webpage.');
    }
  }
}

export const geminiAdapter = new GeminiAdapter();
