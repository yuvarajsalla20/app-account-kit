// Stand-in for expo-image-manipulator: the "JPEG" has as many base64 characters as `sizeAt(compress)` says.
export const SaveFormat = { JPEG: 'jpeg', PNG: 'png' } as const;
export const manipulator = {
  sizeAt: (compress: number) => Math.round(compress * 45_000),
  ops: [] as unknown[],
  saves: [] as number[],
};
export const ImageManipulator = {
  manipulate: (uri: string) => {
    const ctx = {
      crop: (box: unknown) => (manipulator.ops.push({ uri, crop: box }), ctx),
      resize: (size: unknown) => (manipulator.ops.push({ resize: size }), ctx),
      renderAsync: async () => ({
        saveAsync: async ({ compress }: { compress: number }) => (manipulator.saves.push(compress), { base64: 'A'.repeat(manipulator.sizeAt(compress)) }),
      }),
    };
    return ctx;
  },
};
