const FOCUS_MODE_ATTRIBUTE = 'data-rate-focus-mode';

export function createFocusModeController(scope = document) {
  const { ownerDocument: elementDocument } = scope;
  const ownerDocument = elementDocument ?? scope;
  const { documentElement } = ownerDocument;

  function handleKeydown(event) {
    if (event.key === 'Tab') {
      documentElement.setAttribute(FOCUS_MODE_ATTRIBUTE, 'keyboard');
    }
  }

  function handlePointerDown() {
    documentElement.removeAttribute(FOCUS_MODE_ATTRIBUTE);
  }

  ownerDocument.addEventListener('keydown', handleKeydown, true);
  ownerDocument.addEventListener('pointerdown', handlePointerDown, true);

  return {
    destroy() {
      ownerDocument.removeEventListener('keydown', handleKeydown, true);
      ownerDocument.removeEventListener('pointerdown', handlePointerDown, true);
      documentElement.removeAttribute(FOCUS_MODE_ATTRIBUTE);
    },
  };
}
