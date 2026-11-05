import { useState } from 'react';
import type { IconName } from '../types';
import { ChoiceSheet, type Choice } from './ChoiceSheet';
import { SettingRow } from './Row';

interface Props<V extends string | number> {
  icon: IconName;
  tint: string;
  label: string;
  /** A second, smaller line under the label. */
  detail?: string;
  options: readonly Choice<V>[];
  value: V;
  onChange: (value: V) => void;
  /** The sheet's heading. Default: the row's label. */
  title?: string;
  last?: boolean;
  disabled?: boolean;
}

/** A row showing the current choice on the right with an arrow. Tapping it slides a sheet up from the bottom to pick another. Apps use it for their own settings. */
export function PickerRow<V extends string | number = string>({ options, value, onChange, title, ...row }: Props<V>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? String(value);
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
