import Link from 'next/link';
import { Home } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  appName: 'Doctor Portal' | 'Patient Portal';
};

export function Header({ appName }: HeaderProps) {
  return (
    <header className="w-full p-4 border-b bg-card">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
          <div className='hidden sm:flex items-baseline gap-2'>
            <span className='text-muted-foreground'>|</span>
            <span className="text-lg text-foreground">{appName}</span>
          </div>
        </Link>
        <Button asChild variant="outline" size="icon">
          <Link href="/" aria-label="Back to Home">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
