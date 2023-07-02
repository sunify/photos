export function isServer() {
  try {
    const w = window;
    return false;
  } catch (e) {
    return true;
  }
}
