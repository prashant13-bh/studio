'use server';

/**
 * @fileOverview Summarizes the content of a webpage given its URL.
 *
 * - summarizeWebpageContent - A function that takes a URL and returns a summary of the webpage content.
 * - SummarizeWebpageContentInput - The input type for the summarizeWebpageContent function.
 * - SummarizeWebpageContentOutput - The return type for the summarizeWebpageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWebpageContentInputSchema = z.object({
  url: z.string().describe('The URL of the webpage to summarize.'),
});
export type SummarizeWebpageContentInput = z.infer<
  typeof SummarizeWebpageContentInputSchema
>;

const SummarizeWebpageContentOutputSchema = z.object({
  summary: z.string().describe('A short summary of the webpage content.'),
});
export type SummarizeWebpageContentOutput = z.infer<
  typeof SummarizeWebpageContentOutputSchema
>;

export async function summarizeWebpageContent(
  input: SummarizeWebpageContentInput
): Promise<SummarizeWebpageContentOutput> {
  return summarizeWebpageContentFlow(input);
}

const summarizeWebpageContentPrompt = ai.definePrompt({
  name: 'summarizeWebpageContentPrompt',
  input: {schema: SummarizeWebpageContentInputSchema},
  output: {schema: SummarizeWebpageContentOutputSchema},
  prompt: `Summarize the content of the webpage at the following URL:\n\n{{{url}}}`,
});

const summarizeWebpageContentFlow = ai.defineFlow(
  {
    name: 'summarizeWebpageContentFlow',
    inputSchema: SummarizeWebpageContentInputSchema,
    outputSchema: SummarizeWebpageContentOutputSchema,
  },
  async input => {
    const {output} = await summarizeWebpageContentPrompt(input);
    return output!;
  }
);
