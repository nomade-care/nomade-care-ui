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

    const isAudio = communicationData.startsWith('data:audio');
    
    return {
      status: 'success',
      message: 'Response sent and analyzed.',
      insights: result.emotionalInsights,
      originalResponse: communicationData,
      isAudio
    };

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { status: 'error', message: `Failed to process response: ${errorMessage}` };
  }
}

async function fetchAndEncodeAudio(audioUrl: string): Promise<string> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://' + process.env.NEXT_PUBLIC_HOSTING_URL 
      : 'http://localhost:9002';
      
    const absoluteUrl = new URL(audioUrl, baseUrl).href;
    const response = await fetch(absoluteUrl);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch audio from ${absoluteUrl}: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const base64String = Buffer.from(audioBuffer).toString('base64');
    return `data:${contentType};base64,${base64String}`;
}

export async function analyzePatientAudio(audioUrl: string) {
    try {
        const audioDataUri = await fetchAndEncodeAudio(audioUrl);
        const result = await analyzePatientsEmotion({ communicationData: audioDataUri });
        
        // This simulates the client-side logic that would update localStorage
        // We can't directly manipulate localStorage from a server action,
        // so we return the data and let the client handle it.
        // For this simulation, we'll just log it. The important part is that the flow is called.
        console.log("Emotional Insights:", result.emotionalInsights);

        const patientPayload = {
            audioUrl: '', // This was a pre-existing message, not a new response
            text: '',
            insights: result.emotionalInsights,
        };

        // The client-side will need to handle this response.
        // For now, we'll rely on the existing mechanism where the client that calls this
        // will update its own state. The broadcast to the doctor happens via local storage.
         return {
            status: 'success',
            message: 'Audio analyzed.',
            insights: result.emotionalInsights,
            // To make it compatible with PatientResponsePayload
            audioUrl: '',
            text: ''
        };

    } catch (error) {
        console.error("Error in analyzePatientAudio:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { status: 'error', message: `Failed to process audio: ${errorMessage}` };
    }
}
