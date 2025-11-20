export async function invoke<T>(channel: keyof Window['api'], ...args: unknown[]): Promise<T> {
  const method = window.api[channel];
  if (!method) {
    throw new Error(`IPC channel ${String(channel)} not found`);
  }
  return method(...args) as Promise<T>;
}
