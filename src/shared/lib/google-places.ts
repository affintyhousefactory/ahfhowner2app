// Shared promise so concurrent callers all wait on the same load
let _loadPromise: Promise<void> | null = null;

export function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  // Already fully loaded
  if (window.google?.maps?.places?.PlaceAutocompleteElement) return Promise.resolve();

  if (!_loadPromise) {
    _loadPromise = new Promise<void>((resolve, reject) => {
      // callback=__gmpReady satisfies loading=async and fires when bootstrap is ready
      const callbackName = "__gmpReady";
      (window as unknown as Record<string, unknown>)[callbackName] = async () => {
        try {
          await window.google.maps.importLibrary("places");
          resolve();
        } catch (e) {
          reject(e);
        }
      };

      const script = document.createElement("script");
      script.id = "gplaces-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&language=fr&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    });
  }

  return _loadPromise;
}
