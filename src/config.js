const CONFIG_NAME = 'FREIGHT_RATES_CONFIG';

export function getGoogleMapsApiKey() {
  const config = Reflect.get(window, CONFIG_NAME);
  const apiKey = config?.googleMapsApiKey?.trim();

  if (!apiKey) {
    throw new Error(
      '[rate-module] Missing Google Maps API key. Add googleMapsApiKey to window.FREIGHT_RATES_CONFIG.'
    );
  }

  return apiKey;
}
