import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataRow } from '../src/data/DataRow';
import { MenuRow, PullDownMenu } from '../src/ui/PullDown';
import { PickerRow } from '../src/ui/PickerRow';
import { SettingRow } from '../src/ui/Row';
import { AFTER_CLOSE_FALLBACK_MS } from '../src/ui/afterClose';
import { act, mount, press, withAction } from './helpers/render';

// 7.29.0: a pick that opens the share sheet must wait until the Modal it came from has gone, or iPhone does not show the sheet.
type Handle = ReturnType<typeof mount>;
const modalsOpen = (h: Handle) => h.root.root.findAll((n) => n.type === 'Modal').length;

afterEach(() => void vi.useRealTimers());

describe('picks run after the menu or sheet has closed', () => {
  it('pull-down menu row: onPick runs once the menu is gone, not while it is still showing', async () => {
    let h!: Handle;
    const seen: number[] = [];
    const onPick = vi.fn(() => void seen.push(modalsOpen(h)));
    h = mount(
      <MenuRow items={[{ id: 'csv', label: 'CSV' }, { id: 'pdf', label: 'PDF' }]} onPick={onPick}>
        {(show) => <SettingRow icon="download" tint="x" label="Data Export" opensMenu onPress={show} />}
      </MenuRow>,
    );
    await press(h.byLabel('Data Export'));
    expect(modalsOpen(h)).toBe(1);
    await press(h.byLabel('CSV'));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith('csv');
    expect(seen).toEqual([0]);
  });

  it('pull-down picker: onChange runs once the menu is gone', async () => {
    let h!: Handle;
    const seen: number[] = [];
    const onChange = vi.fn(() => void seen.push(modalsOpen(h)));
    h = mount(<PickerRow style="pullDown" icon="clock" tint="x" label="Lock after" options={[{ value: 0, label: 'Now' }, { value: 30, label: '30 s' }]} value={0} onChange={onChange} />);
    await press(h.byLabel('Lock after'));
    await press(h.byLabel('30 s'));
    expect(onChange).toHaveBeenCalledWith(30);
    expect(seen).toEqual([0]);
  });

  it('sheet picker: onChange runs once the sheet is gone', async () => {
    let h!: Handle;
    const seen: number[] = [];
    const onChange = vi.fn(() => void seen.push(modalsOpen(h)));
    h = mount(<PickerRow icon="clock" tint="x" label="Lock after" options={[{ value: 0, label: 'Now' }, { value: 30, label: '30 s' }]} value={0} onChange={onChange} />);
    await press(h.byLabel('Lock after'));
    await press(h.byLabel('30 s'));
    expect(onChange).toHaveBeenCalledWith(30);
    expect(seen).toEqual([0]);
  });

  it('My data with two formats: the download starts once the sheet is gone', async () => {
    let h!: Handle;
    const seen: number[] = [];
    const onDownload = vi.fn(async () => void seen.push(modalsOpen(h)));
    h = withAction((action) => <DataRow label="Download" formats={[{ id: 'csv', label: 'CSV', onDownload }, { id: 'pdf', label: 'PDF', onDownload: async () => {} }]} action={action} />);
    await press(h.byLabel('Download'));
    expect(modalsOpen(h)).toBe(1);
    await press(h.byLabel('CSV'));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([0]);
  });

  it('an app menu that is taken away on close still gets its pick, a moment later', async () => {
    vi.useFakeTimers();
    const onPick = vi.fn();
    function AppMenu() {
      const [open, setOpen] = useState(true);
      return open ? <PullDownMenu anchor={null} items={[{ id: 'a', label: 'Alpha' }]} onPick={onPick} onClose={() => setOpen(false)} /> : null;
    }
    const h = mount(<AppMenu />);
    await press(h.byLabel('Alpha'));
    expect(modalsOpen(h)).toBe(0);
    expect(onPick).not.toHaveBeenCalled();
    await act(async () => void vi.advanceTimersByTime(AFTER_CLOSE_FALLBACK_MS));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith('a');
    // The fallback and a late onDismiss never run it twice.
    await act(async () => void vi.advanceTimersByTime(AFTER_CLOSE_FALLBACK_MS));
    expect(onPick).toHaveBeenCalledTimes(1);
  });
});

describe('My data download waits for the person (7.29.0)', () => {
  it('is never cut off while the share sheet stays open', async () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    let release!: () => void;
    const onDownload = () => new Promise<void>((r) => (release = r));
    const h = withAction((action) => <DataRow label="Download" formats={[{ id: 'csv', label: 'CSV', onDownload }]} action={action} />, { timeoutMs: 1000, tookTooLong: 'Slow.', onError });
    await press(h.byLabel('Download'));
    await act(async () => void vi.advanceTimersByTime(5000));
    expect(h.held.action.note).toBeNull();
    expect(onError).not.toHaveBeenCalled();
    expect(h.held.action.busy).toBe(true);
    await act(async () => void release());
    expect(h.held.action.busy).toBe(false);
    expect(h.held.action.note).toBeNull();
  });
});
