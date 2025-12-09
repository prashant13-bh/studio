'use server';

/**
 * @fileOverview Generates a quick reply to a given message.
 *
 * - generateReplyToMessage - A function that generates a reply to a message.
 * - GenerateReplyToMessageInput - The input type for the generateReplyToMessage function.
 * - GenerateReplyToMessageOutput - The return type for the generateReplyToMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReplyToMessageInputSchema = z.object({
  message: z.string().describe('The message to reply to.'),
});
export type GenerateReplyToMessageInput = z.infer<typeof GenerateReplyToMessageInputSchema>;

const GenerateReplyToMessageOutputSchema = z.object({
  reply: z.string().describe('The generated reply to the message.'),
});
export type GenerateReplyToMessageOutput = z.infer<typeof GenerateReplyToMessageOutputSchema>;

export async function generateReplyToMessage(input: GenerateReplyToMessageInput): Promise<GenerateReplyToMessageOutput> {
  return generateReplyToMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplyToMessagePrompt',
  input: {schema: GenerateReplyToMessageInputSchema},
  output: {schema: GenerateReplyToMessageOutputSchema},
  prompt: `You are a helpful assistant that generates quick replies to messages.\n\nMessage: {{{message}}}\n\nReply:`,
});

const generateReplyToMessageFlow = ai.defineFlow(
  {
    name: 'generateReplyToMessageFlow',
    inputSchema: GenerateReplyToMessageInputSchema,
    outputSchema: GenerateReplyToMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
