'use client';

import { useState, useEffect, useActionState, useCallback, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { sendPatientResponse } from '@/lib/actions';
import { Bell, Loader2, MessageCircle, Send, Mic, Square, Trash2 } from 'lucide-react';
import type { PatientResponsePayload } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { generateWaveform } from '@/lib/waveform';
import { Waveform } from '../shared/Waveform';
import { Textarea } from '../ui/textarea';

export function PatientClient() {
  const [doctorMessage, setDoctorMessage] = useState<string | null>(null);
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');
  const [responseText, setResponseText] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const [formState, formAction] = useActionState(sendPatientResponse, { status: '', message: '' });
  const { status, message, audioUrl: responseAudioUrl, insights } = formState || { status: '', message: '' };

  const handleDoctorMessage = useCallback(() => {
    const message = localStorage.getItem('doctorMessage');
    if (message) {
      setDoctorMessage(message);
      localStorage.removeItem('doctorMessage');
      toast({ title: 'New Message', description: 'You have a new message from your doctor.' });
    }
  }, [toast]);

  useEffect(() => {
    handleDoctorMessage();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'doctorMessage') {
        handleDoctorMessage();
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleDoctorMessage]);

  useEffect(() => {
    if (status === 'success' && responseAudioUrl && insights) {
      const patientResponse: PatientResponsePayload = {
        audioUrl: responseAudioUrl,
        insights: insights,
      };
      localStorage.setItem('patientResponse', JSON.stringify(patientResponse));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'patientResponse',
          newValue: JSON.stringify(patientResponse),
        })
      );

      toast({ title: 'Response Sent', description: 'Your response has been sent to the doctor.' });
      clearRecording();
      setResponseText('');
    } else if (status === 'error') {
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  }, [status, message, responseAudioUrl, insights, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access microphone.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };
  
  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  
  const handleSend = async (formData: FormData) => {
    if (!audioBlob) return;
    const audioDataUri = await blobToDataURL(audioBlob);
    formData.set('audioDataUri', audioDataUri);
    formAction(formData);
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span>Doctor's Message</span>
              </CardTitle>
              <CardDescription>Listen to the latest message from your doctor.</CardDescription>
            </div>
            <LanguageSelector language={patientLanguage} onLanguageChange={setPatientLanguage} />
          </div>
        </CardHeader>
        <CardContent>
          {doctorMessage ? (
            <div className="p-4 rounded-lg bg-muted">
              <AudioPlayer audioUrl={doctorMessage} waveform={generateWaveform(doctorMessage, 50)} />
            </div>
          ) : (
            <Alert className="bg-background">
              <Bell className="h-4 w-4" />
              <AlertTitle>No new messages</AlertTitle>
              <AlertDescription>
                You are all caught up. Check back later for messages from your doctor.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Send a Response</CardTitle>
          <CardDescription>Record a message or type a response to send to your doctor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSend}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {isRecording ? (
                  <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90 rounded-full w-14 h-14">
                    <Square />
                  </Button>
                ) : (
                  <Button size="icon" onClick={startRecording} className="rounded-full w-14 h-14" type="button">
                    <Mic />
                  </Button>
                )}
                <div className="flex-1 h-14 bg-muted rounded-lg flex items-center px-4 gap-4">
                  {audioUrl ? (
                    <>
                      <div className="h-10 flex-1 text-primary">
                        <Waveform data={generateWaveform(audioUrl, 50)} />
                      </div>
                      <Button size="icon" variant="ghost" onClick={clearRecording} type="button">
                        <Trash2 />
                      </Button>
                    </>
                  ) : isRecording ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <Mic className="animate-pulse" />
                      <span>Recording...</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Click the mic to start recording</p>
                  )}
                </div>
              </div>
              <div>
                <Textarea
                  name="responseText"
                  placeholder="Or type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="bg-muted"
                />
              </div>
            </div>
            <SubmitButton disabled={!audioBlob && !responseText} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full mt-6" size="lg" disabled={disabled || pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Response
        </>
      )}
    </Button>
  );
}
