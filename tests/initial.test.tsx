import { describe, expect, it } from 'vitest';
import * as kit from '../src';
import { ProfileHeader } from '../src/profile/ProfileHeader';
import { initialOf } from '../src/profile/nickname';
import { withAction } from './helpers/render';

// 7.29.0: Home avatars in both apps built their initial from the email only. initialOf is the one the Settings avatar uses.
describe('initialOf, shared by Settings and the app’s own avatar', () => {
  it('is exported from the kit, for an avatar outside Settings', () => {
    expect(kit.initialOf).toBe(initialOf);
  });

  it('with a nickname, Home and Settings both show its letter (not the email’s)', () => {
    const h = withAction((action) => <ProfileHeader profile={{ name: 'Sam', fallbackName: 'App', email: 'john@x.com', photo: '' }} action={action} />);
    const drawn = h.root.root.findAll((n) => typeof n.type === 'string' && n.props.children === 'S');
    expect(drawn.length).toBeGreaterThan(0);
    expect(initialOf('Sam', 'john@x.com', 'T')).toBe('S');
  });

  it('keeps a whole emoji, even one made of several parts', () => {
    expect(initialOf('👨‍👩‍👧 family', null)).toBe('👨‍👩‍👧');
    expect(initialOf('', '🇮🇳x@y.com')).toBe('🇮🇳');
    expect(initialOf('', 'éva@x.com')).toBe('É');
  });
});
