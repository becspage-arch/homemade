import 'server-only'
import { headers } from 'next/headers'
import type { User } from '@homemade/db'
import {
  resolveUnitPreferences,
  type UnitPreferences,
} from './units'

/**
 * Resolve the cooking unit / temperature preferences to render a recipe with.
 *
 * A signed-in user's saved enums win; any unset preference (or an anonymous
 * reader) falls back to the request locale per the locked defaults (en-GB →
 * fan °C + grams + UK cups, en-US → °F + US cups, everywhere else → metric).
 * Canonical storage is untouched; this only drives display.
 */
export async function resolveUserUnitPreferences(
  user: Pick<User, 'ovenPreference' | 'weightPreference' | 'volumePreference'> | null,
): Promise<UnitPreferences> {
  const acceptLanguage = (await headers()).get('accept-language')
  return resolveUnitPreferences(
    {
      oven: user?.ovenPreference ?? null,
      weight: user?.weightPreference ?? null,
      volume: user?.volumePreference ?? null,
    },
    acceptLanguage,
  )
}
