'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Bell, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { simulatedConversation } from '@/lib/conversation-data';
import type { ConversationMessage } from '@/lib/types';
import { MessageBubble } from '../shared/MessageBubble';
import { ScrollArea } from '../ui/scroll-area';

export function PatientClient() {
  const [patientLanguage, setPatientLanguage] = useLocalStorage<string>('patientLanguage', 'en');
  const [conversation, setConversation] = useLocalStorage<ConversationMessage[]>('conversation', simulatedConversation);
  
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleNewDoctorMessage = useCallback(() => {
    if (!isMounted) return;
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.from === 'doctor') {
      // Check if this is a new message since the component mounted
      const now = Date.now();
      if(now - lastMessage.timestamp < 5000) { // Arbitrary 5s threshold
        toast({ title: 'New Message', description: 'You have a new message from your doctor.' });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, isMounted]);

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

  useEffect(() => {
      const handlePatientResponse = (e: StorageEvent) => {
          if (e.key === 'patientResponse' && e.newValue) {
              toast({ title: 'Insights Generated', description: 'Your message has been analyzed.' });
          }
      };

      window.addEventListener('storage', handlePatientResponse);
      return () => {
          window.removeEventListener('storage', handlePatientResponse);
      };
  }, [toast]);


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
    </div>
  );
}
