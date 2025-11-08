import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioPlayer } from "./AudioPlayer";
import { Stethoscope, User } from "lucide-react";
import type { ConversationMessage } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

type MessageBubbleProps = {
  message: ConversationMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isDoctor = message.from === 'doctor';

  return (
    <div className={`flex items-end gap-3 ${isDoctor ? '' : 'flex-row-reverse'}`}>
      <Avatar>
        <AvatarFallback className={isDoctor ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent-foreground"}>
          {isDoctor ? <Stethoscope /> : <User />}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col w-full max-w-[400px] ${isDoctor ? 'items-start' : 'items-end'}`}>
        <div className={`p-3 rounded-lg w-full ${isDoctor ? 'bg-muted rounded-bl-none' : 'bg-primary/20 rounded-br-none'}`}>
          <AudioPlayer 
            audioUrl={message.audioUrl} 
            waveform={message.waveform} 
            colorClass={isDoctor ? "text-foreground" : "text-primary"} 
          />
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
