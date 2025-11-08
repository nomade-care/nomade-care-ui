import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 40"
      className={cn("text-primary", props.className)}
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path
          fill="#19a4b3"
          d="M26.2.7c-.5.5-.8 1.2-.8 2v10.3c0 .8.3 1.5.8 2.1.6.6 1.3.9 2.2.9h1.3c.9 0 1.6-.3 2.2-.9.5-.6.8-1.3.8-2.1V2.7c0-.8-.3-1.5-.8-2-.6-.6-1.3-.9-2.2-.9h-1.3c-.9 0-1.6.3-2.2.9Zm-12.7 0c-.5.5-.8 1.2-.8 2v10.3c0 .8.3 1.5.8 2.1.6.6 1.3.9 2.2.9h1.3c.9 0 1.6-.3 2.2-.9.5-.6.8-1.3.8-2.1V2.7c0-.8-.3-1.5-.8-2-.6-.6-1.3-.9-2.2-.9h-1.3c-.9 0-1.6.3-2.2.9ZM39 21.3c-2.4 2.2-5.2 3.3-8.4 3.3s-6-.9-8.2-2.8l-1.3 1.8c-1.3 1.8-3.1 3.2-5.4 4.2-2.3 1-4.7 1.4-7.2 1.4-3.5 0-6.7-.8-9.5-2.5-2.8-1.6-5-3.8-6.5-6.6-1.5-2.8-2.3-5.8-2.3-9C0 5.2.9 2.1 2.8.2l1.6 1.6c-1.4 1.5-2.1 3.4-2.1 5.6 0 3 .8 5.7 2.3 8.1 1.5 2.5 3.6 4.4 6.2 5.7 2.6 1.3 5.4 2 8.5 2 2.1 0 4-.4 5.9-1.2 1.9-.8 3.5-1.9 4.8-3.3l16.1-18c1.3-1.5 2-3.3 2-5.3 0-2.2-.8-4.1-2.2-5.6-1.5-1.5-3.4-2.3-5.6-2.3-2.9 0-5.5 1-7.7 3.1l-1.5-1.8c2.6-2.5 5.7-3.7 9.2-3.7 3.7 0 6.8 1.3 9.4 3.8 2.6 2.5 3.9 5.6 3.9 9.3 0 3-1 5.7-2.9 8.2L39 21.3Z"
        />
        <text
          fill="#31394a"
          fontFamily="Poppins-SemiBold, Poppins"
          fontSize="30"
          fontWeight="500"
          letterSpacing=".8"
          transform="translate(42)"
        >
          <tspan x="0" y="29">
            omad
          </tspan>
        </text>
        <text
          fontFamily="Poppins-SemiBold, Poppins"
          fontSize="30"
          fontWeight="500"
          letterSpacing=".8"
          transform="translate(42)"
        >
          <tspan x="108.62" y="29" fill="#19a4b3">
            C
          </tspan>
          <tspan x="129.53" y="29" fill="#31394a">
            are
          </tspan>
        </text>
      </g>
    </svg>
  );
}
