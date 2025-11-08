'use client';

import { useState, useEffect, useCallback, useRef, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Bell, MessageCircle, Mic, Send, Square, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { generateWaveform } from '@/lib/waveform';
import { Waveform } from '../shared/Waveform';
import { Textarea } from '../ui/textarea';
import { simulatedConversation } from '@/lib/conversation-data';
import type { ConversationMessage, PatientResponsePayload } from '@/lib/types';
import { MessageBubble } from '../shared/MessageBubble';
import { ScrollArea } from '../ui/scroll-area';
import { sendPatientResponse } from '@/lib/actions';

export function PatientClient() {
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');
  const [conversation, setConversation] = useLocalStorage<ConversationMessage[]>('conversation', simulatedConversation);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [communicationData, setCommunicationData] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

  const [formState, formAction] = useActionState(sendPatientResponse, { status: '', message: '' });
  const { status, message, insights, originalResponse } = formState || { status: '', message: '' };

  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'success' && insights && originalResponse) {
      const isAudio = originalResponse.startsWith('data:audio');
      
      if (isAudio) {
        setConversation(prev => [...prev, { 
          id: `patient-${Date.now()}`, 
          from: 'patient', 
          audioUrl: originalResponse, 
          waveform: generateWaveform(originalResponse, 50),
          timestamp: Date.now()
        }]);
      }

      const patientPayload: PatientResponsePayload = {
        audioUrl: isAudio ? originalResponse : '',
        text: !isAudio ? originalResponse : '',
        insights,
      };

      localStorage.setItem('patientResponse', JSON.stringify(patientPayload));
      window.dispatchEvent(new StorageEvent('storage', { key: 'patientResponse', newValue: JSON.stringify(patientPayload) }));
      
      clearRecording();
      setResponseText('');
      setCommunicationData('');
      formRef.current?.reset();
      toast({ title: "Response Sent", description: "Your response has been sent to the doctor." });

    } else if (status === 'error') {
      toast({ variant: 'destructive', title: "Error", description: message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, message, insights, originalResponse]);
  

  const handleNewDoctorMessage = useCallback(() => {
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.from === 'doctor') {
      toast({ title: 'New Message', description: 'You have a new message from your doctor.' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  useEffect(() => {
    handleNewDoctorMessage();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'conversation') {
        const newConversation = JSON.parse(e.newValue || '[]');
        setConversation(newConversation);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleNewDoctorMessage, setConversation]);

  const handleAudioBlob = async (blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setResponseText(''); // Clear text if audio is recorded
    const dataUri = await blobToDataURL(blob);
    setCommunicationData(dataUri);
  };

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
        handleAudioBlob(blob);
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
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    if (!responseText) {
      setCommunicationData('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResponseText(text);
    if (text) {
      clearRecording();
      setCommunicationData(text);
    } else if (audioBlob) {
      blobToDataURL(audioBlob).then(setCommunicationData);
    } else {
      setCommunicationData('');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span>Conversation</span>
              </CardTitle>
              <CardDescription>Listen to the latest messages from your doctor and review your responses.</CardDescription>
            </div>
            <LanguageSelector language={patientLanguage} onLanguageChange={setPatientLanguage} />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {isMounted && conversation.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {isMounted && conversation.length === 0 && (
                 <Alert className="bg-background">
                  <Bell className="h-4 w-4" />
                  <AlertTitle>No messages yet</AlertTitle>
                  <AlertDescription>
                    Check back later for messages from your doctor.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <form action={formAction} ref={formRef}>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Send a Response</CardTitle>
            <CardDescription>Record a message or type a response to send to your doctor.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {isRecording ? (
                    <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90 rounded-full w-14 h-14" type="button">
                      <Square />
                    </Button>
                  ) : (
                    <Button size="icon" onClick={startRecording} className="rounded-full w-14 h-14" type="button" disabled={!!responseText}>
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
                      <p className="text-muted-foreground">Click the mic to record or start typing below</p>
                    )}
                  </div>
                </div>
                <div>
                  <Textarea
                    name="responseText"
                    placeholder="Or type your response here..."
                    className="bg-muted"
                    value={responseText}
                    onChange={handleTextChange}
                  />
                </div>
                <div className='flex justify-end'>
                  <input type="hidden" name="communicationData" value={communicationData} />
                  <Button type="submit" disabled={!communicationData}>
                    <Send className='mr-2'/>
                    Send Response
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
