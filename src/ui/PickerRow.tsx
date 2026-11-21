import { useState } from 'react';
import { useLook } from '../look';
import type { IconName } from '../types';
import { useAfterClose } from './afterClose';
import { ChoiceSheet, type Choice } from './ChoiceSheet';
import { MenuRow } from './PullDown';
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
  /** 7.26.0: this row's own style, over the screen's `pickers`. */
  style?: 'sheet' | 'pullDown';
}

/**
 * A row showing the current choice on the right. Tapping it slides a sheet up from the bottom to pick another, or, with
 * `pickers: 'pullDown'` (7.26.0), floats a menu right under the row with the value in a grey pill. Apps use it for their own settings.
 */
export function PickerRow<V extends string | number = string>({ options, value, onChange, title, style, ...row }: Props<V>) {
  const { pickers } = useLook();
  const [open, setOpen] = useState(false);
  const after = useAfterClose();
  const chosen = options.find((o) => o.value === value);
  const current = chosen?.label ?? String(value);
  if ((style ?? pickers) === 'pullDown') {
    return (
      <MenuRow
        pill={chosen?.pill ?? current}
        items={options.map((o) => ({ id: String(o.value), label: o.label, detail: o.detail, icon: o.icon, checked: o.value === value }))}
        onPick={(id) => {
          const next = options.find((o) => String(o.value) === id);
          if (next && next.value !== value) onChange(next.value);
        }}
      >
        {(show, badge) => <SettingRow {...row} value={current} badge={badge} opensMenu onPress={show} />}
      </MenuRow>
    );
  }
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
          // 7.29.0: once the sheet has gone, so a change that opens something of its own (a prompt, a sheet) is shown on iPhone.
          if (next !== value) after.later(() => onChange(next));
        }}
        onClose={() => setOpen(false)}
        onDismiss={after.onDismiss}
      />
    </>
  );
}
