"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getConsent } from "./CookieBanner";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (getConsent() === "granted") {
      setEnabled(true);
      return;
    }
    function onGrant() {
      setEnabled(true);
    }
    window.addEventListener("ahf-consent-granted", onGrant);
    return () => window.removeEventListener("ahf-consent-granted", onGrant);
  }, []);

  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
