'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Mic, Send, Bot, Square, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ConversationMessage, PatientResponsePayload } from '@/lib/types';
import { sendDoctorAudio } from '@/lib/actions';
import { Waveform } from '@/components/shared/Waveform';
import { LanguageSelector } from '../shared/LanguageSelector';
import { MessageBubble } from '../shared/MessageBubble';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const generateWaveform = (length = 50) => Array.from({ length }, () => Math.random());

export function DoctorClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const [conversation, setConversation] = useLocalStorage<ConversationMessage[]>('conversation', []);
  const [emotionalInsights, setEmotionalInsights] = useLocalStorage<string>('emotionalInsights', 'Awaiting patient response...');
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');

  const [formState, formAction] = useFormState(sendDoctorAudio, { status: '', message: '' });

  useEffect(() => {
    const handlePatientResponse = () => {
        const responseData = localStorage.getItem('patientResponse');
        if (responseData) {
            try {
                const { audioUrl, insights }: PatientResponsePayload = JSON.parse(responseData);
                setEmotionalInsights(insights);
                setConversation(prev => [...prev, {
                  id: `patient-${Date.now()}`,
                  from: 'patient',
                  audioUrl,
                  waveform: generateWaveform(),
                  timestamp: Date.now()
                }]);
                // Clear the response so it's not processed again
                localStorage.removeItem('patientResponse');
            } catch (error) {
                console.error("Failed to parse patient response", error);
            }
        }
    };
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'patientResponse') {
            handlePatientResponse();
        }
    });

    return () => {
        window.removeEventListener('storage', handlePatientResponse);
    }
  }, [setConversation, setEmotionalInsights]);


  useEffect(() => {
    if (formState.status === 'success' && formState.originalAudioUrl) {
      setConversation(prev => [...prev, { 
        id: `doc-${Date.now()}`, 
        from: 'doctor', 
        audioUrl: formState.originalAudioUrl!, 
        waveform: generateWaveform(), 
        timestamp: Date.now()
      }]);
      
      const doctorMessage = formState.translatedAudioUrl;
      localStorage.setItem('doctorMessage', doctorMessage!);
      window.dispatchEvent(new StorageEvent('storage', { key: 'doctorMessage', newValue: doctorMessage! }));
      
      clearRecording();
      toast({ title: "Message Sent", description: formState.message });
    } else if (formState.status === 'error') {
      toast({ variant: 'destructive', title: "Error", description: formState.message });
    }
  }, [formState, setConversation, toast]);

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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Microphone Error", description: "Could not access microphone." });
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
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };
  
  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleSend = async () => {
    if (!audioBlob) return;
    const audioDataUri = await blobToDataURL(audioBlob);
    const formData = new FormData();
    formData.append('audioDataUri', audioDataUri);
    formData.append('language', patientLanguage);
    formAction(formData);
  };
  
  const { pending } = useFormStatus();

  return (
    <div className="grid md:grid-cols-3 h-full">
      <div className="md:col-span-2 flex flex-col h-full bg-card">
        {/* Conversation Area */}
        <div className="flex-1 p-6 overflow-hidden">
           <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {conversation.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            </div>
           </ScrollArea>
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <div className="flex items-center gap-4">
              <LanguageSelector language={patientLanguage} onLanguageChange={setPatientLanguage} disabled={isRecording} />
              <div className="flex-1 h-14 bg-muted rounded-lg flex items-center px-4 gap-4">
                  {audioUrl ? (
                    <>
                      <div className="h-10 flex-1 text-primary"><Waveform data={generateWaveform()} /></div>
                      <Button size="icon" variant="destructive" onClick={clearRecording}><Trash2/></Button>
                    </>
                  ) : (
                    isRecording ? (
                        <div className="flex items-center gap-2 text-destructive">
                            <Mic className="animate-pulse" />
                            <span>Recording...</span>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Click the mic to start recording</p>
                    )
                  )}
              </div>
              {isRecording ? (
                  <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90 rounded-full w-14 h-14">
                      <Square />
                  </Button>
              ) : (
                  <form action={handleSend}>
                      <Button type="submit" size="icon" disabled={!audioBlob || pending} className="rounded-full w-14 h-14">
                          {pending ? <Loader2 className="animate-spin" /> : <Send />}
                      </Button>
                  </form>
              )}
               {!audioUrl && !isRecording && (
                <Button size="icon" onClick={startRecording} className="rounded-full w-14 h-14">
                    <Mic />
                </Button>
               )}
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <aside className="hidden md:block border-l bg-background/50">
        <Card className="h-full rounded-none border-none">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>Emotional Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Patient Emotion Analysis</AlertTitle>
              <AlertDescription className="prose prose-sm dark:prose-invert">
                 <p className="text-muted-foreground whitespace-pre-wrap">{emotionalInsights}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
