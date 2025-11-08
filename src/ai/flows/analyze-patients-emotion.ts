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
  audioDataUri: z
    .string()
    .describe(
      'The patient audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type AnalyzePatientsEmotionInput = z.infer<typeof AnalyzePatientsEmotionInputSchema>;

const AnalyzePatientsEmotionOutputSchema = z.object({
  emotionalInsights: z
    .string()
    .describe('The emotional insights extracted from the patient audio.'),
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
  prompt: `You are an AI assistant specialized in analyzing patient audio for emotional content and providing emotional insights.

  Analyze the patient audio and detect the emotions expressed. Provide structured emotional insights that doctors can use to better understand the patient's emotional state.
  Audio: {{media url=audioDataUri}}`,
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
