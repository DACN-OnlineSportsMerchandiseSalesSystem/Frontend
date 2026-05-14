import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

export function TurnstileWidget({ siteKey, onVerify, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Chờ script Cloudflare load xong
    const checkTurnstile = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(checkTurnstile);
        
        // Tránh render trùng lặp
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          theme: "light",
        });
      }
    }, 500);

    return () => {
      clearInterval(checkTurnstile);
      if (widgetIdRef.current) {
        // window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={containerRef} className={className} />;
}
