import { describe, expect, it } from 'vitest';
import { initialBoardOpen } from '../../src/ui/preferences';

describe('initialBoardOpen', () => {
  it('follows what the player chose last time', () => {
    expect(initialBoardOpen('open', true)).toBe(true);
    expect(initialBoardOpen('closed', false)).toBe(false);
  });

  it('starts open on a roomy screen and closed on a small one when nothing was chosen', () => {
    expect(initialBoardOpen(null, false)).toBe(true);
    expect(initialBoardOpen(null, true)).toBe(false);
    expect(initialBoardOpen('garbage', false)).toBe(true);
  });
});
