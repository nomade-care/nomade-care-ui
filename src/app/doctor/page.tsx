import { DoctorClient } from "@/components/doctor/DoctorClient";
import { Header } from "@/components/shared/Header";

export default function DoctorPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header appName="Doctor Portal" />
      <main className="flex-1 overflow-hidden">
        <DoctorClient />
      </main>
    </div>
  );
}
