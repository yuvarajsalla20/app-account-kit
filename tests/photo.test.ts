import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PHOTO_MAX_CHARS, isPermissionError, safePhoto } from '../src/logic/photo';
import { PROFILE_PHOTO_SIZE, cameraSupported, pickProfilePhoto } from '../src/photo';
import { manipulator } from './stubs/expo-image-manipulator';
import { picker } from './stubs/expo-image-picker';

// 7.29.0: the profile photo picker moved into the kit from both apps, and the default limit matches their Firestore rules.
const DATA = 'data:image/jpeg;base64,';

beforeEach(() => {
  picker.granted = true;
  picker.result = { canceled: false, assets: [{ uri: 'file://a.jpg', width: 1200, height: 800 }] };
  picker.calls = [];
  manipulator.sizeAt = (compress) => Math.round(compress * 45_000);
  manipulator.ops = [];
  manipulator.saves = [];
});

describe('photo limit', () => {
  it('defaults to 80,000 characters, the limit in both apps’ Firestore rules', () => {
    expect(DEFAULT_PHOTO_MAX_CHARS).toBe(80_000);
    expect(safePhoto(DATA + 'A'.repeat(80_000 - DATA.length))).toBe(true);
    expect(safePhoto(DATA + 'A'.repeat(80_001 - DATA.length))).toBe(false);
  });
});

describe('pickProfilePhoto (app-account-kit/photo)', () => {
  it('crops a centred square, shrinks it to 256 px and returns a JPEG data address under the default limit', async () => {
    const photo = await pickProfilePhoto('library');
    expect(picker.calls).toEqual(['library']);
    expect(manipulator.ops).toEqual([{ uri: 'file://a.jpg', crop: { originX: 200, originY: 0, width: 800, height: 800 } }, { resize: { width: PROFILE_PHOTO_SIZE, height: PROFILE_PHOTO_SIZE } }]);
    expect(photo!.startsWith(DATA)).toBe(true);
    expect(photo!.length).toBeLessThanOrEqual(DEFAULT_PHOTO_MAX_CHARS);
    expect(safePhoto(photo)).toBe(true);
    expect(cameraSupported).toBe(true);
  });

  it('saves again at a lower quality until the photo fits the limit', async () => {
    manipulator.sizeAt = (compress) => (compress > 0.3 ? 120_000 : 30_000);
    const photo = await pickProfilePhoto('library');
    expect(manipulator.saves).toEqual([0.6, 0.4, 0.25]);
    expect(photo!.length).toBeLessThanOrEqual(DEFAULT_PHOTO_MAX_CHARS);
    manipulator.saves = [];
    manipulator.sizeAt = () => 30_000;
    await pickProfilePhoto('library', { maxChars: 20_000 });
    expect(manipulator.saves).toEqual([0.6, 0.4, 0.25]);
  });

  it('returns null when cancelled, and throws "permission" when the camera is refused', async () => {
    picker.result = { canceled: true, assets: [] };
    expect(await pickProfilePhoto('library')).toBeNull();
    picker.granted = false;
    const error = await pickProfilePhoto('camera').catch((e: unknown) => e);
    expect(isPermissionError(error)).toBe(true);
    expect(picker.calls).toEqual(['library']);
  });
});
