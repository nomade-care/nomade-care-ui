# **App Name**: MediVoxAI

## Core Features:

- Doctor Audio Recording: Record and send audio messages to the backend. Stores recordings temporarily.
- Doctor Audio Visualization: Display waveform visualization of audio messages recorded and received by the doctor.
- Patient Audio Playback: Receive and playback audio messages. Stores audio temporarily.
- Patient Audio Visualization: Display waveform visualization of received audio in patient app.
- Audio Translation: Translate doctor's audio to patient's language using Gemini before playback on the patient app. Use the Gemini tool to perform translation to other languages
- Emotion Analysis: Analyze patient's audio for emotional content and use Gemini LLM tool to interpret and return structured emotional insights for the doctor. Pass the patient’s audio to an emotion detection API. Pass the emotion data to Gemini LLM tool for interpretation.
- Emotional Insights Display: Display structured emotional insights in a side panel of the Doctor App.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) to evoke trust and calm.
- Background color: Light gray (#F0F4F8) to create a clean and professional look.
- Accent color: Muted purple (#B39DDB) for subtle highlights and interactive elements.
- Body and headline font: 'PT Sans', a modern and readable sans-serif.
- Use clean, simple icons related to medical and emotional concepts.
- Doctor app: Side panel for emotional insights on the right; audio controls at the bottom. Patient app: Central audio playback with clear controls.
- Smooth transitions for audio playback and emotion insight updates.