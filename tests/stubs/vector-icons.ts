import { createElement } from 'react';

export const Feather = Object.assign((props: Record<string, unknown>) => createElement('Icon', props), { glyphMap: {} });
