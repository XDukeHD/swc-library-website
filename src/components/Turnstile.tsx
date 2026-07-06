'use client';

import { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export default function Turnstile({ onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY;

  useEffect(() => {
    if (!siteKey) {
      console.error('NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY is missing.');
      return;
    }

    const loadAndRender = () => {
      if (typeof window !== 'undefined' && (window as any).turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'expired-callback': onExpire,
          'error-callback': onError,
        });
      }
    };

    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = loadAndRender;
      document.body.appendChild(script);
    } else {
      if ((window as any).turnstile) {
        loadAndRender();
      } else {
        script.addEventListener('load', loadAndRender);
      }
    }

    return () => {
      if (widgetIdRef.current && typeof window !== 'undefined' && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error('Error removing Turnstile widget:', e);
        }
        widgetIdRef.current = null;
      }
      if (script) {
        script.removeEventListener('load', loadAndRender);
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  if (!siteKey) {
    return <div className="text-xs text-brand-red font-semibold">Turnstile Site Key missing</div>;
  }

  return (
    <div className="flex justify-center w-full my-2">
      <div ref={containerRef} className="cf-turnstile min-h-[65px]" />
    </div>
  );
}
