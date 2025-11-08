import { PatientClient } from "@/components/patient/PatientClient";
import { Header } from "@/components/shared/Header";

export default function PatientPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header appName="Patient Portal" />
      <main className="flex-1">
        <PatientClient />
      </main>
    </div>
  );
}
