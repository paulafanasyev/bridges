import { useMemo } from 'react';
import { User, CompatScore } from '../types';
import { calculateCompatibility, getCompatColor, getCompatEmoji } from '../utils/compatibility';

export function useCompatibility(user1: User, user2: User) {
  const compat = useMemo<CompatScore>(
    () => calculateCompatibility(user1, user2),
    [user1, user2]
  );

  const color = useMemo(() => getCompatColor(compat.total), [compat.total]);
  const emoji = useMemo(() => getCompatEmoji(compat.total), [compat.total]);

  return { ...compat, color, emoji };
}