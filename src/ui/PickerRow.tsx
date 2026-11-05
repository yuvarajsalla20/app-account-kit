import { useState } from 'react';
import type { IconName } from '../types';
import { ChoiceSheet, type Choice } from './ChoiceSheet';
import { SettingRow } from './Row';

interface Props {
  icon: IconName;
  tint: string;
  label: string;
  options: readonly Choice[];
  value: string;
  onChange: (value: string) => void;
  /** The sheet's heading. Default: the row's label. */
  title?: string;
  last?: boolean;
  disabled?: boolean;
}

/** A row showing the current choice on the right with an arrow. Tapping it slides a sheet up from the bottom to pick another. Apps use it for their own settings. */
export function PickerRow({ options, value, onChange, title, ...row }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <>
      <SettingRow {...row} value={current} onPress={() => setOpen(true)} />
      <ChoiceSheet
        visible={open}
        title={title ?? row.label}
        options={options}
        value={value}
        onChoose={(next) => {
          setOpen(false);
          if (next !== value) onChange(next);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
