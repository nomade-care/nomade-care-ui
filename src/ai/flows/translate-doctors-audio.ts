'use server';

/**
 * @fileOverview A flow to translate doctor's audio to the patient's language.
 *
 * - translateDoctorsAudio - A function that handles the audio translation process.
 * - TranslateDoctorsAudioInput - The input type for the translateDoctorsAudio function.
 * - TranslateDoctorsAudioOutput - The return type for the translateDoctorsAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateDoctorsAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A doctor's recorded audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientLanguage: z.string().describe('The target language for the translation.'),
});
export type TranslateDoctorsAudioInput = z.infer<typeof TranslateDoctorsAudioInputSchema>;

const TranslateDoctorsAudioOutputSchema = z.object({
  translatedAudioDataUri: z
    .string()
    .describe(
      'The translated audio data URI in the patient language, which must include a MIME type and use Base64 encoding.'
    ),
});
export type TranslateDoctorsAudioOutput = z.infer<typeof TranslateDoctorsAudioOutputSchema>;

export async function translateDoctorsAudio(
  input: TranslateDoctorsAudioInput
): Promise<TranslateDoctorsAudioOutput> {
  return translateDoctorsAudioFlow(input);
}

const translationPrompt = ai.definePrompt({
    name: 'translationPrompt',
    input: { schema: z.object({ audioDataUri: z.string(), patientLanguage: z.string() }) },
    output: { schema: z.string() },
    prompt: `Translate the following transcription to {{patientLanguage}}.
    
    Transcription:
    {{media url=audioDataUri}}
    `
});

const translateDoctorsAudioFlow = ai.defineFlow(
  {
    name: 'translateDoctorsAudioFlow',
    inputSchema: TranslateDoctorsAudioInputSchema,
    outputSchema: TranslateDoctorsAudioOutputSchema,
  },
  async input => {
    // 1. Transcribe the audio and translate it to the target language in one step
    const translatedText = await translationPrompt(input);
    
    if (!translatedText) {
        throw new Error('Could not translate the audio.');
    }

    // 2. Convert the translated text to speech
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: translatedText,
    });

    if (!media) {
      throw new Error('No translated audio data was returned.');
    }

    return {translatedAudioDataUri: media.url};
  }
);
