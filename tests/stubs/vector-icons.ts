import { createElement } from 'react';

const Feather = Object.assign((props: Record<string, unknown>) => createElement('Icon', props), { glyphMap: {} });
export default Feather;
