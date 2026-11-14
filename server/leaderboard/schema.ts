/** Validation of a submitted time. Everything a browser sends is untrusted. */
import { z } from 'zod';
import { NAME_MAX, SEED_MAX, type Submission, TIME_MAX_MS, TIME_MIN_MS, WRONG_CLICKS_MAX, cleanName } from '../../shared/leaderboard.js';

const submissionSchema = z
  .object({
    name: z.string().max(NAME_MAX * 8),
    timeMs: z.number().int().min(TIME_MIN_MS).max(TIME_MAX_MS),
    wrongClicks: z.number().int().min(0).max(WRONG_CLICKS_MAX),
    seed: z.string().max(SEED_MAX).regex(/^[A-Za-z0-9_-]*$/),
  })
  .strict();

export type ParseResult = { readonly ok: true; readonly value: Submission } | { readonly ok: false; readonly error: string };

/** Check and normalise a submission. The name is cleaned; an empty result is rejected. */
export function parseSubmission(input: unknown): ParseResult {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'That time could not be accepted.' };
  const name = cleanName(parsed.data.name);
  if (name === '') return { ok: false, error: 'Please enter a username.' };
  return { ok: true, value: { ...parsed.data, name } };
}
