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

const prompt = ai.definePrompt({
  name: 'translateDoctorsAudioPrompt',
  input: {schema: TranslateDoctorsAudioInputSchema},
  output: {schema: TranslateDoctorsAudioOutputSchema},
  prompt: `You are a medical translation expert. You will receive audio in one language and must return a translated audio in another language.

  Translate the provided audio data to the specified patient language.

  Audio: {{media url=audioDataUri}}
  Patient Language: {{{patientLanguage}}}
  Return only the translated audio data URI.
`,
});

const translateDoctorsAudioFlow = ai.defineFlow(
  {
    name: 'translateDoctorsAudioFlow',
    inputSchema: TranslateDoctorsAudioInputSchema,
    outputSchema: TranslateDoctorsAudioOutputSchema,
  },
  async input => {
    // Call the text-to-speech model to translate audio data to the patient's language
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: `Translate to ${input.patientLanguage}. ${input.audioDataUri}`,
    });

    if (!media) {
      throw new Error('No translated audio data was returned.');
    }

    return {translatedAudioDataUri: media.url};
  }
);
