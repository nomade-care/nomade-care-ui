'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { Bell, MessageCircle, Mic, Square, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { generateWaveform } from '@/lib/waveform';
import { Waveform } from '../shared/Waveform';
import { Textarea } from '../ui/textarea';
import { simulatedConversation } from '@/lib/conversation-data';
import type { ConversationMessage } from '@/lib/types';
import { MessageBubble } from '../shared/MessageBubble';
import { ScrollArea } from '../ui/scroll-area';

export function PatientClient() {
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');
  const [conversation, setConversation] = useLocalStorage<ConversationMessage[]>('conversation', simulatedConversation);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const handleNewDoctorMessage = useCallback(() => {
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.from === 'doctor') {
      toast({ title: 'New Message', description: 'You have a new message from your doctor.' });
    }
  }, [conversation, toast]);

  useEffect(() => {
    handleNewDoctorMessage();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'conversation') {
        const newConversation = JSON.parse(e.newValue || '[]');
        setConversation(newConversation);
        handleNewDoctorMessage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleNewDoctorMessage, setConversation]);


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
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };
  
  const lastDoctorMessage = [...conversation].reverse().find(m => m.from === 'doctor');

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
              {conversation.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {conversation.length === 0 && (
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
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Simulate a Response</CardTitle>
          <CardDescription>Record a message or type a response to simulate sending a message to your doctor.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {isRecording ? (
                  <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90 rounded-full w-14 h-14" type="button">
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
                  className="bg-muted"
                />
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
