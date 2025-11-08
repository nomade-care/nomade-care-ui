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
import { detectEmotionFromAudio, EmotionApiResponse } from '@/services/emotion-api';

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

const emotionPrompt = ai.definePrompt({
  name: 'analyzePatientsEmotionPrompt',
  input: {schema: z.union([
    z.object({ communicationData: z.string() }),
    z.object({ emotionData: z.any() })
  ])},
  output: {schema: AnalyzePatientsEmotionOutputSchema},
  prompt: `You are an expert AI assistant with a high degree of emotional intelligence, specialized in analyzing patient communications for a medical setting. Your task is to analyze the provided patient communication and generate concise, structured emotional insights for a doctor.

  {{#if emotionData}}
  An external API has analyzed the patient's audio and provided the following emotional analysis. Please interpret this data into a human-readable summary for the doctor. Highlight the primary emotion and confidence level.

  Emotion API Data:
  \`\`\`json
  {{{jsonStringify emotionData}}}
  \`\`\`
  {{else}}
  The patient provided a text response. Please analyze the following text for emotional tone and content.
  
  Patient Text: "{{{communicationData}}}"
  {{/if}}

  Based on the input, provide a summary of the patient's emotional state. Structure your output in markdown.

  Example Output for Audio:
  "
  **Overall Emotion:** Happy (Confidence: 92%)

  **Key Points:**
  - The patient's voice indicates a positive emotional state.
  - No signs of distress or anger were detected.
  "

  Example Output for Text:
  "
  **Overall Tone:** Positive

  **Key Points:**
  - The patient expresses contentment with their progress.
  - They mention feeling better and ask a follow-up question.
  "`,
});


const analyzePatientsEmotionFlow = ai.defineFlow(
  {
    name: 'analyzePatientsEmotionFlow',
    inputSchema: AnalyzePatientsEmotionInputSchema,
    outputSchema: AnalyzePatientsEmotionOutputSchema,
  },
  async (input) => {
    const isAudio = input.communicationData.startsWith('data:audio');
    let promptInput;

    if (isAudio) {
      // Call the external emotion API for audio data
      const emotionData = await detectEmotionFromAudio(input.communicationData);
      promptInput = { emotionData };
    } else {
      // Use text directly for text data
      promptInput = { communicationData: input.communicationData };
    }

    const {output} = await emotionPrompt(promptInput);
    return output!;
  }
);
