// Stand-in for expo-image-picker: a test sets what the next pick returns.
export const picker = {
  granted: true,
  result: { canceled: false, assets: [{ uri: 'file://a.jpg', width: 1200, height: 800 }] } as { canceled: boolean; assets: { uri: string; width: number; height: number }[] },
  calls: [] as string[],
};
export const requestCameraPermissionsAsync = async () => ({ granted: picker.granted });
export const launchCameraAsync = async () => (picker.calls.push('camera'), picker.result);
export const launchImageLibraryAsync = async () => (picker.calls.push('library'), picker.result);
