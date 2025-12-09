'use server';

/**
 * @fileOverview A flow to generate creative ideas based on a given prompt.
 *
 * - generateIdeas - A function that generates creative ideas from a prompt.
 * - GenerateIdeasInput - The input type for the generateIdeas function.
 * - GenerateIdeasOutput - The return type for the generateIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIdeasInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate ideas from.'),
  numberOfIdeas: z
    .number()
    .default(3)
    .describe('The number of ideas to generate.'),
});
export type GenerateIdeasInput = z.infer<typeof GenerateIdeasInputSchema>;

const GenerateIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('The generated ideas.'),
});
export type GenerateIdeasOutput = z.infer<typeof GenerateIdeasOutputSchema>;

export async function generateIdeas(input: GenerateIdeasInput): Promise<GenerateIdeasOutput> {
  return generateIdeasFlow(input);
}

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: {schema: GenerateIdeasInputSchema},
  output: {schema: GenerateIdeasOutputSchema},
  prompt: `You are a creative brainstorming assistant. Generate {{numberOfIdeas}} ideas based on the following prompt:\n\nPrompt: {{{prompt}}}\n\nIdeas:`,
});

const generateIdeasFlow = ai.defineFlow(
  {
    name: 'generateIdeasFlow',
    inputSchema: GenerateIdeasInputSchema,
    outputSchema: GenerateIdeasOutputSchema,
  },
  async input => {
    const {output} = await generateIdeasPrompt(input);
    return output!;
  }
);
