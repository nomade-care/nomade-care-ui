import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, User } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="mb-12 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="h-16 w-auto" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Seamless, AI-powered communication bridging language barriers and providing emotional insights for better healthcare.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Stethoscope className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Doctor's Portal</CardTitle>
            <CardDescription>Record messages, view patient responses, and gain AI-driven emotional insights.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/doctor">Open Doctor App</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-accent/20 rounded-full mb-4">
              <User className="h-10 w-10 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl font-headline">Patient's Portal</CardTitle>
            <CardDescription>Receive and listen to your doctor's messages in your preferred language.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/patient">Open Patient App</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NomadCare. Revolutionizing patient care.</p>
      </footer>
    </div>
  );
}
