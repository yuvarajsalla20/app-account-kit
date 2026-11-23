import { useRef, useState } from 'react';
import { useLook } from '../look';
import type { IconName } from '../types';
import { useAfterClose } from './afterClose';
import { ChoiceSheet, type Choice } from './ChoiceSheet';
import { MenuRow } from './PullDown';
import { SettingRow } from './Row';
import { offeredOptions, usePremiumOffered } from '../planMode';

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
  /** 7.33.0: called on every pick, before anything else, such as to play the sound just picked. Locked options call it too. */
  onPick?: (value: V) => void;
  /**
   * 7.33.0: true for an option that needs the paid plan: it shows a padlock and is not kept. 10.0.0: while the plan mode is
   * `'free'`, such an option is not offered, unless it is the chosen one.
   */
  locked?: (value: V) => boolean;
  /** 7.33.0: a pick of a locked option, such as opening the plans. */
  onLocked?: (value: V) => void;
  /** 7.33.0: a short line of explanation: at the top of the menu, or under the options in the sheet. */
  note?: string;
}

/**
 * A row showing the current choice on the right. Tapping it slides a sheet up from the bottom to pick another, or, with
 * `pickers: 'pullDown'` (7.26.0), floats a menu right under the row with the value in a grey pill. Apps use it for their own settings.
 */
export function PickerRow<V extends string | number = string>({ options: given, value, onChange, title, style, onPick, locked: lockedIn, onLocked, note, ...row }: Props<V>) {
  const { pickers } = useLook();
  // 10.0.0: while Premium is not offered, the locked options are left out and nothing shows a padlock.
  const offered = usePremiumOffered();
  const locked = offered ? lockedIn : undefined;
  const options = offered || !lockedIn ? given : offeredOptions(given, false, (o) => lockedIn(o.value), (o) => o.value === value);
  const [open, setOpen] = useState(false);
  const after = useAfterClose();
  // The sheet tells only that a locked option was tapped; the pick just before says which one.
  const lastPick = useRef<V>(value);
  const chosen = options.find((o) => o.value === value);
  const current = chosen?.label ?? String(value);
  if ((style ?? pickers) === 'pullDown') {
    return (
      <MenuRow
        pill={chosen?.pill ?? current}
        head={note}
        items={options.map((o, i) => {
          const isLocked = !!locked?.(o.value);
          // The first locked option starts its own group, so the paid ones read as a set under the included ones.
          const group = isLocked && i > 0 && !locked?.(options[i - 1]!.value);
          return { id: String(o.value), label: o.label, detail: o.detail, icon: o.icon, lead: o.lead, checked: o.value === value, ...(isLocked ? { locked: true } : {}), ...(group ? { group: true } : {}) };
        })}
        onPick={(id) => {
          const next = options.find((o) => String(o.value) === id);
          if (!next) return;
          onPick?.(next.value);
          if (locked?.(next.value)) return onLocked?.(next.value);
          if (next.value !== value) onChange(next.value);
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
        onPick={(picked) => {
          lastPick.current = picked;
          onPick?.(picked);
        }}
        locked={locked}
        onLocked={onLocked ? () => onLocked(lastPick.current) : undefined}
        note={note}
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
