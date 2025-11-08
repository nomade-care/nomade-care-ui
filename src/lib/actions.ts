'use server';

import { z } from 'zod';
import { translateDoctorsAudio } from '@/ai/flows/translate-doctors-audio';
import { analyzePatientsEmotion } from '@/ai/flows/analyze-patients-emotion';

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
  communicationData: z.string(),
});

export async function sendPatientResponse(prevState: any, formData: FormData) {
  try {
    const { communicationData } = sendPatientResponseSchema.parse({
      communicationData: formData.get('communicationData'),
    });
    
    if (!communicationData) {
      return { status: 'error', message: 'No response data provided.' };
    }

    const result = await analyzePatientsEmotion({ communicationData });
    
    return {
      status: 'success',
      message: 'Response sent and analyzed.',
      insights: result.emotionalInsights,
      originalResponse: communicationData,
    };

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { status: 'error', message: `Failed to process response: ${errorMessage}` };
  }
}