import { useState, type ReactNode } from 'react';
import type { IconName } from '../types';
import { SettingRow } from './Row';

interface Props {
  icon: IconName;
  tint: string;
  label: string;
  last?: boolean;
  /** Shown under the row while it is open. */
  children: ReactNode;
}

/** A row with an arrow that opens its content right below it and turns the arrow down. Tap again to close. Used for Contact support and Kits; apps can use it too. */
export function ExpandRow({ children, ...row }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <SettingRow {...row} expanded={open} onPress={() => setOpen((o) => !o)}>
      {open ? children : null}
    </SettingRow>
  );
}
