import { describe, expect, it, vi } from 'vitest';

import { createPlacesService, normalizePlaceSuggestions } from '../src/services/places-service.js';

function createSuggestion({ mainText, placeId, secondaryText, text, types }) {
  return {
    placePrediction: {
      mainText: { text: mainText },
      placeId,
      secondaryText: { text: secondaryText },
      text: { text },
      types,
    },
  };
}

const rotterdam = createSuggestion({
  mainText: 'Rotterdam',
  placeId: 'rotterdam-id',
  secondaryText: 'Netherlands',
  text: 'Rotterdam, Netherlands',
  types: ['locality', 'political'],
});

const rotterdamAddress = createSuggestion({
  mainText: 'Westblaak 180',
  placeId: 'rotterdam-address-id',
  secondaryText: 'Rotterdam, Netherlands',
  text: 'Westblaak 180, Rotterdam, Netherlands',
  types: ['street_address'],
});

const maringaWithAccent = createSuggestion({
  mainText: 'Maringá',
  placeId: 'maringa-accent-id',
  secondaryText: 'Brazil',
  text: 'Maringá, Brazil',
  types: ['locality', 'political'],
});

const maringaWithoutAccent = createSuggestion({
  mainText: 'Maringa',
  placeId: 'maringa-plain-id',
  secondaryText: 'Brazil',
  text: 'Maringa, Brazil',
  types: ['locality', 'political'],
});

describe('Places service', () => {
  it('normalizes city and address predictions and removes duplicate city labels', () => {
    expect(normalizePlaceSuggestions([rotterdam, rotterdamAddress])).toEqual([
      {
        label: 'Rotterdam, Netherlands',
        placeId: 'rotterdam-id',
        value: 'rotterdam-id',
      },
    ]);
  });

  it('removes duplicate city labels that differ only by accents', () => {
    expect(normalizePlaceSuggestions([maringaWithAccent, maringaWithoutAccent])).toEqual([
      {
        label: 'Maringá, Brazil',
        placeId: 'maringa-accent-id',
        value: 'maringa-accent-id',
      },
    ]);
  });

  it('uses a city-only request and falls back for a street or postal query', async () => {
    class AutocompleteSessionToken {}

    const fetchAutocompleteSuggestions = vi
      .fn()
      .mockResolvedValueOnce({ suggestions: [] })
      .mockResolvedValueOnce({ suggestions: [rotterdamAddress] });
    const service = createPlacesService(async () => ({
      AutocompleteSessionToken,
      AutocompleteSuggestion: { fetchAutocompleteSuggestions },
    }));
    const sessionToken = await service.createSessionToken();
    const suggestions = await service.getSuggestions('Westblaak 180', sessionToken);

    expect(fetchAutocompleteSuggestions).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ includedPrimaryTypes: ['(cities)'] })
    );
    expect(fetchAutocompleteSuggestions).toHaveBeenNthCalledWith(
      2,
      expect.not.objectContaining({ includedPrimaryTypes: expect.anything() })
    );
    expect(suggestions[0].label).toBe('Rotterdam, Netherlands');
  });
});
