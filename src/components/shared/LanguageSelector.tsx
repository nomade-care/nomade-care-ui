'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages } from "lucide-react";

const supportedLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
];

type LanguageSelectorProps = {
  language: string;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
};

export function LanguageSelector({ language, onLanguageChange, disabled }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
        <Languages className="h-5 w-5 text-muted-foreground"/>
        <Select value={language} onValueChange={onLanguageChange} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
            {supportedLanguages.map(lang => (
            <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
            </SelectItem>
            ))}
        </SelectContent>
        </Select>
    </div>
  )
}
