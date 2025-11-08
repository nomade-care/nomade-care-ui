'use server';

/**
 * @fileOverview A flow to analyze the patient's audio for emotional content and provide insights.
 *
 * - analyzePatientsEmotion - A function that handles the emotion analysis process.
 * - AnalyzePatientsEmotionInput - The input type for the analyzePatientsEmotion function.
 * - AnalyzePatientsEmotionOutput - The return type for the analyzePatientsEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePatientsEmotionInputSchema = z.object({
  communicationData: z
    .string()
    .describe(
      "The patient's communication, which can be an audio data URI or a text string. Expected format: 'data:<mimetype>;base64,<encoded_data>' or a simple string."
    ),
});
export type AnalyzePatientsEmotionInput = z.infer<typeof AnalyzePatientsEmotionInputSchema>;

const AnalyzePatientsEmotionOutputSchema = z.object({
  emotionalInsights: z
    .string()
    .describe('A concise, structured summary of the patient\'s emotional state in markdown format.'),
});
export type AnalyzePatientsEmotionOutput = z.infer<typeof AnalyzePatientsEmotionOutputSchema>;

export async function analyzePatientsEmotion(
  input: AnalyzePatientsEmotionInput
): Promise<AnalyzePatientsEmotionOutput> {
  return analyzePatientsEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePatientsEmotionPrompt',
  input: {schema: AnalyzePatientsEmotionInputSchema},
  output: {schema: AnalyzePatientsEmotionOutputSchema},
  prompt: `You are an expert AI assistant with a high degree of emotional intelligence, specialized in analyzing patient communications for a medical setting. Your task is to analyze the provided patient communication (which could be audio or text) and generate concise, structured emotional insights for a doctor.

  Based on the input, provide a summary of the patient's emotional state. Structure your output in markdown.

  Example Output:
  "
  **Overall Emotion:** Happy (Confidence: 92%)

  **Key Points:**
  - The patient expresses positive sentiment.
  - There are no signs of distress or anger.
  - Vocal tone is calm and neutral.
  "

  Patient Communication: {{#if (startsWith communicationData "data:audio")}} {{media url=communicationData}} {{else}} {{{communicationData}}} {{/if}}`,
});

const analyzePatientsEmotionFlow = ai.defineFlow(
  {
    name: 'analyzePatientsEmotionFlow',
    inputSchema: AnalyzePatientsEmotionInputSchema,
    outputSchema: AnalyzePatientsEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
