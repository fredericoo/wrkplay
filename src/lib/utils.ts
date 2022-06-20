import { format } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';

/**
 * Promise.all for Object instead of Array.
 *
 * Inspired by Bluebird Promise.props() and https://github.com/sindresorhus/p-props
 *
 * Improvements:
 *
 * - Exported as { pProps }, so IDE auto-completion works
 * - Simpler: no support for Map, Mapper, Options
 * - Included Typescript typings (no need for @types/p-props)
 *
 * Concurrency implementation via pMap was removed in favor of preserving async
 * stack traces (more important!).
 */
export async function pProps<T>(input: { [K in keyof T]: T[K] | Promise<T[K]> }): Promise<{
  [K in keyof T]: Awaited<T[K]>;
}> {
  const keys = Object.keys(input);
  // `as any` here is added to make it compile when `noUncheckedIndexedAccess` is false
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.fromEntries((await Promise.all(Object.values(input))).map((v, i) => [keys[i], v])) as any;
}

export const clamp = (num: number, min = -9999999, max = 9999999) => {
  Math.min(Math.max(num, min), max);
};

/**
 * Moves points from the losing side to the winning side.
 * @param date Date to be formatted
 * @param pattern pattern according to https://date-fns.org/v2.28.0/docs/format.
 */
export const formatDateTime = (date: Date, pattern: string) => format(date, pattern, { locale: enGB });
