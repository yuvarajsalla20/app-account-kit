import type { ActionRunner } from '../../hooks/useAction';
import { useLook } from '../../context';
import type { DataProps } from '../../types';
import { SettingRow } from '../../ui/Row';
import { TINTS } from '../../ui/tints';

interface Props extends DataProps {
  action: ActionRunner;
}

/** The data download row. The app does the work; the kit shows it and reports a failure. */
export function DataRow({ label, value, onDownload, action }: Props) {
  const { strings } = useLook();
  return <SettingRow last icon="download" tint={TINTS.data} label={label} value={value} disabled={action.busy} onPress={() => action.run('download', onDownload, () => strings.couldNot(strings.download))} />;
}
