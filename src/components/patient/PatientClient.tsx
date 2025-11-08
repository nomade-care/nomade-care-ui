'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { patientAudioSamples } from '@/lib/audio-samples';
import { sendPatientResponse } from '@/lib/actions';
import { Bell, Loader2, MessageCircle, Send } from 'lucide-react';
import type { PatientResponsePayload } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const generateWaveform = (length = 50) => Array.from({ length }, () => Math.random());

export function PatientClient() {
  const [doctorMessage, setDoctorMessage] = useState<string | null>(null);
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const [formState, formAction] = useFormState(sendPatientResponse, { status: '', message: '' });

  useEffect(() => {
    const handleDoctorMessage = () => {
      const message = localStorage.getItem('doctorMessage');
      if(message) {
        setDoctorMessage(message);
        localStorage.removeItem('doctorMessage');
        toast({ title: "New Message", description: "You have a new message from your doctor." });
      }
    };
    
    handleDoctorMessage();
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'doctorMessage') {
        handleDoctorMessage();
      }
    });

    return () => {
        window.removeEventListener('storage', (e) => {
            if (e.key === 'doctorMessage') handleDoctorMessage();
        });
    }

  }, [toast]);
  
  useEffect(() => {
    if (formState.status === 'success' && formState.audioUrl && formState.insights) {
      const patientResponse: PatientResponsePayload = {
        audioUrl: formState.audioUrl,
        insights: formState.insights,
      };
      localStorage.setItem('patientResponse', JSON.stringify(patientResponse));
      window.dispatchEvent(new StorageEvent('storage', { key: 'patientResponse', newValue: JSON.stringify(patientResponse) }));
      
      toast({ title: "Response Sent", description: "Your response has been sent to the doctor." });
      setSelectedResponse(null);
    } else if (formState.status === 'error') {
      toast({ variant: 'destructive', title: "Error", description: formState.message });
    }
  }, [formState, toast]);

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
              <AudioPlayer audioUrl={doctorMessage} waveform={generateWaveform()} />
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
          <CardDescription>Choose a pre-recorded response to send to your doctor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="space-y-3">
              {patientAudioSamples.map((sample) => (
                <div
                  key={sample.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedResponse === sample.dataUri ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedResponse(sample.dataUri)}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="audioDataUri"
                      value={sample.dataUri}
                      checked={selectedResponse === sample.dataUri}
                      onChange={() => setSelectedResponse(sample.dataUri)}
                      className="h-4 w-4 text-primary focus:ring-primary border-muted-foreground"
                    />
                    <span>{sample.label}</span>
                  </label>
                </div>
              ))}
            </div>
            <SubmitButton disabled={!selectedResponse} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormState(sendPatientResponse, { status: '', message: '' });

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
