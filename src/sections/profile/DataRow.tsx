import { useState } from 'react';
import type { ActionRunner } from '../../hooks/useAction';
import { useLook } from '../../look';
import type { DataFormat, DataProps } from '../../types';
import { ChoiceSheet } from '../../ui/ChoiceSheet';
import { SettingRow } from '../../ui/Row';

interface Props extends DataProps {
  action: ActionRunner;
}

/** The data download row. The app makes the files; the kit shows the choice (a sheet when there is more than one format) and reports a failure. */
export function DataRow({ label, formats, action }: Props) {
  const { theme, strings } = useLook();
  const [open, setOpen] = useState(false);
  const run = (format: DataFormat) => action.run('download', format.onDownload, () => strings.couldNot(strings.download));
  const [only, ...others] = formats;
  const many = others.length > 0;
  return (
    <>
      <SettingRow last icon="download" tint={theme.tints.data} label={label} value={many ? undefined : only.label} disabled={action.busy} onPress={() => (many ? setOpen(true) : run(only))} />
      {many ? (
        <ChoiceSheet
          visible={open}
          title={label}
          options={formats.map((f) => ({ value: f.id, label: f.label }))}
          onChoose={(id) => {
            setOpen(false);
            const format = formats.find((f) => f.id === id);
            if (format) run(format);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
