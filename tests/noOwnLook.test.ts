import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
  });

describe('the kit has no look of its own', () => {
  it('contains no color literal: every color comes from the app\'s theme', () => {
    const offenders = files('src').filter((f) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
