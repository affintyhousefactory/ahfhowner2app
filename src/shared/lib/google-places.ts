export function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.google?.maps?.places) { resolve(); return; }

    const existing = document.getElementById("gplaces-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.id = "gplaces-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}
