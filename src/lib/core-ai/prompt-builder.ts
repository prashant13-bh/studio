import { Message } from './interfaces';
import { countTokens } from './tokenizer';

const RESPONSE_BUFFER = 500; // Reserve tokens for the model's response

export class PromptBuilder {
  private messages: Message[] = [];
  private systemInstruction: string = "You are a helpful AI assistant.";
  private tokenLimit: number;
  
  constructor(tokenLimit: number = 8192) {
    this.tokenLimit = tokenLimit;
  }

  public setSystem(instruction: string): this {
    this.systemInstruction = instruction;
    return this;
  }

  public addUserMessage(content: string, context?: string): this {
    let finalContent = content;
    if (context) {
      finalContent = `Context:\n${context}\n\nQuestion:\n${content}`;
    }
    this.messages.push({ role: 'user', content: finalContent });
    return this;
  }

  public addAssistantMessage(content: string): this {
    this.messages.push({ role: 'assistant', content });
    return this;
  }

  public build(): Message[] {
    const fullMessages = [
      { role: 'system' as const, content: this.systemInstruction },
      ...this.messages
    ];
    
    return this.enforceTokenLimit(fullMessages);
  }

  private enforceTokenLimit(messages: Message[]): Message[] {
    const maxTokens = this.tokenLimit - RESPONSE_BUFFER;
    let totalTokens = messages.reduce((acc, msg) => acc + countTokens(msg.content), 0);

    if (totalTokens <= maxTokens) {
      return messages;
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const processedMessages: Message[] = [];
    if(systemMessage) {
        processedMessages.push(systemMessage);
        totalTokens = countTokens(systemMessage.content);
    } else {
        totalTokens = 0;
    }

    // Hybrid Sliding Window: Keep system message and N most recent messages, then fill with oldest
    const recentMessagesCount = 5; // Keep last 5 messages
    const recentMessages = conversationMessages.slice(-recentMessagesCount);
    const olderMessages = conversationMessages.slice(0, -recentMessagesCount);

    // Add recent messages first
    for (let i = recentMessages.length - 1; i >= 0; i--) {
        const message = recentMessages[i];
        const tokens = countTokens(message.content);
        if (totalTokens + tokens <= maxTokens) {
            processedMessages.splice(1, 0, message);
            totalTokens += tokens;
        } else {
            // Stop if we can't even fit recent messages
            return processedMessages;
        }
    }

    // Fill remaining space with older messages
    for (let i = olderMessages.length - 1; i >= 0; i--) {
        const message = olderMessages[i];
        const tokens = countTokens(message.content);
        if (totalTokens + tokens <= maxTokens) {
            processedMessages.splice(1, 0, message);
            totalTokens += tokens;
        } else {
            break; 
        }
    }
    
    return processedMessages;
  }
}
