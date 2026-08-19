import { afterEach, describe, expect, it } from 'vitest';

import { createFocusModeController } from '../src/rate-module/ui/focus-mode-controller.js';

describe('focus mode controller', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-rate-focus-mode');
  });

  it('shows focus styling after Tab and removes it before pointer focus', () => {
    const controller = createFocusModeController(document);

    document.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));

    expect(document.documentElement.getAttribute('data-rate-focus-mode')).toBe('keyboard');

    document.dispatchEvent(new window.Event('pointerdown', { bubbles: true }));

    expect(document.documentElement.hasAttribute('data-rate-focus-mode')).toBe(false);

    controller.destroy();
  });
});
