export function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    // Déjà chargé
    if (window.google?.maps?.places) { resolve(); return; }

    const existing = document.getElementById("gplaces-script");
    if (existing) {
      // Script en cours de chargement — attendre le onload
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed")));
      return;
    }

    const script = document.createElement("script");
    script.id = "gplaces-script";
    // loading=async nécessite importLibrary() et casse window.google.maps.places
    // On utilise le pattern classique &libraries=places qui expose places après onload
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}
