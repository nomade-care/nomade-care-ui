import type { ConversationMessage } from '@/lib/types';
import { generateWaveform } from '@/lib/waveform';

const now = Date.now();

export const simulatedConversation: ConversationMessage[] = [
  {
    id: `doc-1`,
    from: 'doctor',
    audioUrl: '/audios/doctor_scenario_1.mp3',
    waveform: generateWaveform('/audios/doctor_scenario_1.mp3', 50),
    timestamp: now - 1000 * 60 * 20, // 20 minutes ago
  },
  {
    id: `patient-1`,
    from: 'patient',
    audioUrl: '/audios/patient_scenario_2.mp3',
    waveform: generateWaveform('/audios/patient_scenario_2.mp3', 50),
    timestamp: now - 1000 * 60 * 15, // 15 minutes ago
  },
  {
    id: `doc-2`,
    from: 'doctor',
    audioUrl: '/audios/doctor_scenario_3.mp3',
    waveform: generateWaveform('/audios/doctor_scenario_3.mp3', 50),
    timestamp: now - 1000 * 60 * 10, // 10 minutes ago
  },
  {
    id: `patient-2`,
    from: 'patient',
    audioUrl: '/audios/patient_scenario_4.mp3',
    waveform: generateWaveform('/audios/patient_scenario_4.mp3', 50),
    timestamp: now - 1000 * 60 * 5, // 5 minutes ago
  },
];
