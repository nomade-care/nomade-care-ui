import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import Image from "next/image";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/logo.jpg"
      alt="Nomadecare Logo"
      width={200}
      height={40}
      className={cn("text-primary", props.className)}
      {...props}
  />
  );
}
