import { getGoogleMapsApiKey } from '../config.js';

const CALLBACK_NAME = '__freightRatesGoogleMapsReady';
const SCRIPT_SELECTOR = 'script[data-rate-google-maps]';

let placesLibraryPromise;

function getGoogleMaps() {
  return Reflect.get(window, 'google')?.maps;
}

export function loadGooglePlacesLibrary() {
  const existingMaps = getGoogleMaps();

  if (existingMaps?.importLibrary) {
    return existingMaps.importLibrary('places');
  }

  if (placesLibraryPromise) return placesLibraryPromise;

  const apiKey = getGoogleMapsApiKey();

  placesLibraryPromise = new Promise((resolve, reject) => {
    function rejectLoad() {
      placesLibraryPromise = undefined;
      reject(new Error('[rate-module] Google Maps JavaScript API could not be loaded.'));
    }

    Reflect.set(window, CALLBACK_NAME, async () => {
      try {
        const maps = getGoogleMaps();

        if (!maps?.importLibrary) throw new Error('Google Maps importLibrary is unavailable.');

        resolve(await maps.importLibrary('places'));
      } catch {
        rejectLoad();
      } finally {
        Reflect.deleteProperty(window, CALLBACK_NAME);
      }
    });

    const existingScript = document.querySelector(SCRIPT_SELECTOR);

    if (existingScript) {
      existingScript.addEventListener('error', rejectLoad, { once: true });
      return;
    }

    const params = new URLSearchParams({
      callback: CALLBACK_NAME,
      key: apiKey,
      language: 'en',
      loading: 'async',
      v: 'weekly',
    });
    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.dataset.rateGoogleMaps = '';
    script.addEventListener('error', rejectLoad, { once: true });
    document.head.append(script);
  });

  return placesLibraryPromise;
}
