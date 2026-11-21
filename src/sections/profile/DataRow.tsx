import { useState } from 'react';
import type { ActionRunner } from '../../hooks/useAction';
import { useLook } from '../../look';
import type { DataFormat, DataProps } from '../../types';
import { useAfterClose } from '../../ui/afterClose';
import { ChoiceSheet } from '../../ui/ChoiceSheet';
import { SettingRow } from '../../ui/Row';

interface Props extends DataProps {
  action: ActionRunner;
}

/** The data download row. The app makes the files; the kit shows the choice (a sheet when there is more than one format) and reports a failure. */
export function DataRow({ label, formats, action }: Props) {
  const { theme, strings } = useLook();
  const [open, setOpen] = useState(false);
  const after = useAfterClose();
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
            // 7.29.0: download once the sheet has gone, so the share sheet it opens is shown on iPhone.
            if (format) after.later(() => void run(format));
          }}
          onClose={() => setOpen(false)}
          onDismiss={after.onDismiss}
        />
      ) : null}
    </>
  );
}
