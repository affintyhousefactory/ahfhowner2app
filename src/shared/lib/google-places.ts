export async function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return;

  // Si le bootstrap est déjà prêt, charger la lib places directement
  if (window.google?.maps?.importLibrary) {
    await window.google.maps.importLibrary("places");
    return;
  }

  // Injecter le bootstrap script (loading=async, sans &libraries=)
  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("gplaces-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "gplaces-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&language=fr`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps bootstrap failed to load"));
    document.head.appendChild(script);
  });

  // Charger dynamiquement la librairie Places
  await window.google.maps.importLibrary("places");
}
