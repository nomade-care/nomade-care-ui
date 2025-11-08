import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import Image from "next/image";
import logo from "../../../public/logo.png"
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src={logo}
      alt="Nomadecare Logo"
      width={200}
      height={40}
      className={cn("text-primary", props.className)}
      {...props}
  />
  );
}
