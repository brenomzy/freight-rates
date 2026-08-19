import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

describe('test environment', () => {
  it('provides a document for rate module tests', () => {
    document.body.innerHTML = '<div class="rate-module_component"></div>';

    expect(document.querySelectorAll('.rate-module_component')).toHaveLength(1);
  });
});
