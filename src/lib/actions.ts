'use server';

import { z } from 'zod';
import { translateDoctorsAudio } from '@/ai/flows/translate-doctors-audio';
import { analyzePatientsEmotion } from '@/ai/flows/analyze-patients-emotion';

// This is a placeholder for a silent audio file to be used when only text is provided.
const SILENT_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const sendDoctorAudioSchema = z.object({
  audioDataUri: z.string(),
  language: z.string(),
});

export async function sendDoctorAudio(prevState: any, formData: FormData) {
  try {
    const { audioDataUri, language } = sendDoctorAudioSchema.parse({
      audioDataUri: formData.get('audioDataUri'),
      language: formData.get('language'),
    });

    if (!language || language === 'en') {
      return {
        status: 'success',
        message: 'Audio sent. No translation needed.',
        translatedAudioUrl: audioDataUri,
        originalAudioUrl: audioDataUri,
      };
    }

    const result = await translateDoctorsAudio({ audioDataUri, patientLanguage: language });

    return {
      status: 'success',
      message: `Audio translated to ${language}`,
      translatedAudioUrl: result.translatedAudioDataUri,
      originalAudioUrl: audioDataUri,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { status: 'error', message: `Failed to process audio: ${errorMessage}` };
  }
}

const sendPatientResponseSchema = z.object({
  audioDataUri: z.string().optional(),
  responseText: z.string().optional(),
});

export async function sendPatientResponse(prevState: any, formData: FormData) {
  try {
    const parsed = sendPatientResponseSchema.parse({
      audioDataUri: formData.get('audioDataUri'),
      responseText: formData.get('responseText'),
    });

    // If there's text, we use it for analysis. Otherwise, we use the audio.
    // If only text is provided, we send a silent audio URI for consistency.
    const audioForAnalysis = parsed.responseText ? `Text from patient: ${parsed.responseText}` : parsed.audioDataUri!;
    const audioUrlForResponse = parsed.audioDataUri || SILENT_AUDIO_DATA_URI;
    
    if (!audioForAnalysis) {
        throw new Error("No audio or text data provided for analysis.");
    }

    const result = await analyzePatientsEmotion({ audioDataUri: audioForAnalysis });

    return {
      status: 'success',
      message: 'Patient response analyzed.',
      insights: result.emotionalInsights,
      audioUrl: audioUrlForResponse,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { status: 'error', message: `Failed to analyze response: ${errorMessage}` };
  }
}
