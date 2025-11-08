export type ConversationMessage = {
  id: string;
  from: 'doctor' | 'patient';
  audioUrl: string;
  waveform: number[];
  timestamp: number;
};

export type PatientResponsePayload = {
  audioUrl: string;
  text: string;
  insights: string;
};
