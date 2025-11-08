'use server';

import { z } from 'zod';

const EmotionApiResponseSchema = z.object({
  detected_emotion: z.string(),
  confidence: z.number(),
  top_predictions: z.array(
    z.object({
      emotion: z.string(),
      confidence: z.number(),
    })
  ),
  processing_time: z.number(),
  timestamp: z.string(),
});

export type EmotionApiResponse = z.infer<typeof EmotionApiResponseSchema>;

// The user-provided URL for the emotion detection API.
const API_URL = 'https://b1f8af9fb6b5.ngrok-free.app/recognize_emotion';

/**
 * Calls the external emotion detection API with the provided audio data URI.
 * @param audioDataUri The audio data URI to be analyzed.
 * @returns A promise that resolves to the emotion analysis response.
 */
export async function detectEmotionFromAudio(audioDataUri: string): Promise<EmotionApiResponse> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // The API expects the audio data URI directly.
        audio_data_uri: audioDataUri,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Emotion API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    // Validate the response against the Zod schema.
    const parsedResult = EmotionApiResponseSchema.safeParse(result);
    if (!parsedResult.success) {
      console.error('Invalid response from emotion API:', parsedResult.error);
      throw new Error('Invalid response structure from emotion API.');
    }

    return parsedResult.data;
  } catch (error) {
    console.error('Error calling emotion API:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to get emotion analysis: ${error.message}`);
    }
    throw new Error('An unknown error occurred while analyzing emotion.');
  }
}
