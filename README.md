# NomadCare - AI-Powered Medical Communication Platform

NomadCare is a modern, AI-driven web application designed to bridge communication gaps between doctors and patients, especially those who speak different languages. It provides separate portals for doctors and patients to exchange audio messages, leveraging generative AI for real-time translation and emotional analysis.

## ✨ Key Features

-   **Dual Portals**: Separate, tailored user interfaces for doctors and patients.
-   **Audio Messaging**: Doctors can record and send audio messages. Patients can listen to these messages and review their pre-recorded responses.
-   **AI-Powered Translation**: Doctor's messages are automatically translated into the patient's preferred language using Google's generative AI models.
-   **AI-Powered Emotion Analysis**: Patient's audio responses are analyzed by a custom API and then summarized by an LLM to provide doctors with concise emotional insights, helping them better understand the patient's state.
-   **Simulated Conversation**: The application boots up with a pre-populated, simulated conversation to demonstrate the core features without needing initial user input.
-   **Responsive Design**: A modern, clean UI that works seamlessly across different devices.

## 🛠️ Technology Stack

This project is built with a modern, full-stack TypeScript architecture.

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **AI/Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit) for creating and managing AI flows (translation, text-to-speech, and summarization).
-   **UI**: [React](https://react.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
-   **Component Library**: [ShadCN UI](https://ui.shadcn.com/) for accessible and reusable components.
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation & Setup

1.  **Clone the repository** (or ensure you are in the project directory).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root of the project. You will need to add your Google AI API key for the Genkit flows to work.

    ```env
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

4.  **Run the Genkit Development Server**:
    The AI flows run on a separate development server. Open a new terminal and run:

    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit server, typically on port `3400`.

5.  **Run the Next.js Development Server**:
    In your primary terminal, run the main application:

    ```bash
    npm run dev
    ```
    This will start the Next.js application, which by default runs on `http://localhost:9002`.

6.  **Open the App**:
    Navigate to `http://localhost:9002` in your browser to see the application.

## 📂 Project Structure

-   `src/app/`: Contains the main pages and layouts for the Next.js App Router (`/`, `/doctor`, `/patient`).
-   `src/components/`: Shared and feature-specific React components.
    -   `src/components/ui/`: Auto-generated ShadCN UI components.
    -   `src/components/shared/`: Components used across different parts of the app (e.g., `Header`, `AudioPlayer`).
    -   `src/components/doctor/` & `src/components/patient/`: Components specific to each portal.
-   `src/ai/`: All Genkit-related code.
    -   `src/ai/genkit.ts`: Genkit initialization and configuration.
    -   `src/ai/flows/`: Genkit flows for AI-powered features like translation and emotion analysis.
-   `src/lib/`: Contains server actions (`actions.ts`), type definitions (`types.ts`), and other utility functions.
-   `src/services/`: Services for communicating with external APIs, like the emotion detection service.
-   `public/`: Static assets, including the logo and the sample audio files for the simulated conversation.
