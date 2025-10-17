import type { SVGProps } from 'react';

export function FirefoxLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.6 4.5c-.2.8-.1 1.6.2 2.3.3.7.7 1.3 1.3 1.7.6.4 1.3.6 2 .6.8.1 1.6-.1 2.3-.4.7-.3 1.3-.7 1.7-1.3.4-.6.6-1.3.6-2-.1-.8-.4-1.6-.8-2.2-.5-.6-1.1-1.1-1.8-1.4-.7-.3-1.5-.4-2.2-.3-1.5.2-2.8 1.1-3.6 2.3z" />
      <path d="M12.5 8.5A6.2 6.2 0 0 1 19 13c0 2.2-1.2 4.2-3 5.4" />
      <path d="M6.5 12.5c0-2.4 1.2-4.6 3.1-6" />
      <path d="M12.5 18.8c-1.2.8-2.7 1.2-4.2 1.2-2.5 0-4.8-1-6.5-2.7" />
      <path d="M10 13c-2.3 1.4-3.5 4-3.5 6.5" />
    </svg>
  );
}
