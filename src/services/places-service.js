import { loadGooglePlacesLibrary } from './google-maps-loader.js';

const CITY_TYPES = new Set([
  'administrative_area_level_3',
  'locality',
  'postal_town',
  'sublocality',
]);
const MAX_SUGGESTIONS = 5;

function getTextValue(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value?.text === 'string') return value.text.trim();

  return '';
}

function getTextParts(value) {
  return getTextValue(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function getLastItem(items) {
  return items[items.length - 1];
}

export function normalizePlaceSuggestion(suggestion) {
  const prediction = suggestion?.placePrediction;

  if (!prediction?.placeId) return null;

  const mainText = getTextValue(prediction.mainText);
  const secondaryParts = getTextParts(prediction.secondaryText);
  const fullParts = getTextParts(prediction.text);
  const isCity = prediction.types?.some((type) => CITY_TYPES.has(type));
  const city = isCity
    ? mainText || fullParts[0]
    : secondaryParts[0] || fullParts[fullParts.length - 2] || mainText;
  const country = getLastItem(secondaryParts) || getLastItem(fullParts);

  if (!city || !country || city === country) return null;

  return {
    label: `${city}, ${country}`,
    placeId: prediction.placeId,
    value: prediction.placeId,
  };
}

export function normalizePlaceSuggestions(suggestions) {
  const seenLabels = new Set();
  const normalized = [];

  for (const suggestion of suggestions) {
    const place = normalizePlaceSuggestion(suggestion);
    const normalizedLabel = place?.label.toLocaleLowerCase('en');

    if (!place || seenLabels.has(normalizedLabel)) continue;

    seenLabels.add(normalizedLabel);
    normalized.push(place);

    if (normalized.length === MAX_SUGGESTIONS) break;
  }

  return normalized;
}

export function createPlacesService(loadLibrary = loadGooglePlacesLibrary) {
  async function createSessionToken() {
    const { AutocompleteSessionToken } = await loadLibrary();

    return new AutocompleteSessionToken();
  }

  async function getSuggestions(input, sessionToken) {
    const { AutocompleteSuggestion } = await loadLibrary();
    const request = {
      includedPrimaryTypes: ['(cities)'],
      input,
      language: 'en',
      sessionToken,
    };
    let response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    if (!response.suggestions.length) {
      const fallbackRequest = {
        input: request.input,
        language: request.language,
        sessionToken: request.sessionToken,
      };

      response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(fallbackRequest);
    }

    return normalizePlaceSuggestions(response.suggestions);
  }

  return {
    createSessionToken,
    getSuggestions,
  };
}
