/**
 * Dynamically loads the Google Identity Services SDK script into the document body.
 * Returns a promise that resolves with the window.google object once loaded.
 */
export function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    document.body.appendChild(script);
  });
}
