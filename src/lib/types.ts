export type ConversationMessage = {
  id: string;
  from: 'doctor' | 'patient';
  audioUrl: string;
  waveform: number[];
  timestamp: number;
};

export type PatientResponsePayload = {
  audioUrl: string;
  insights: string;
};
