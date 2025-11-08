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
      "The patient audio data as a data URI that must include a MIME type and use Base64 encoding. This can also be a string of text if the patient typed a response. Expected format: 'data:<mimetype>;base64,<encoded_data>' or a simple string."
    ),
});
export type AnalyzePatientsEmotionInput = z.infer<typeof AnalyzePatientsEmotionInputSchema>;

const AnalyzePatientsEmotionOutputSchema = z.object({
  emotionalInsights: z
    .string()
    .describe('The emotional insights extracted from the patient audio or text.'),
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
  prompt: `You are an AI assistant specialized in analyzing patient audio and text for emotional content and providing emotional insights.

  Analyze the patient's communication (which could be audio or text) and detect the emotions expressed. Provide structured emotional insights that doctors can use to better understand the patient's emotional state.
  
  If the input is a data URI, it is audio. If it is a plain string, it is text.
  
  Patient Communication: {{#if (startsWith audioDataUri "data:audio")}} {{media url=audioDataUri}} {{else}} {{{audioDataUri}}} {{/if}}`,
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
