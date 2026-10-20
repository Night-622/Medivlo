/**
 * Background clock for a co-op host whose tab is hidden (src/net/backgroundSim.ts). Browsers stop
 * requestAnimationFrame in hidden tabs and throttle main-thread timers, but not a dedicated worker's timers, so
 * this posts ~30 ticks a second and the page advances the sim on each. Owner: Claude 6.
 */
let timer: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e: MessageEvent<'start' | 'stop'>) => {
  if (e.data === 'start' && !timer) timer = setInterval(() => (self as unknown as Worker).postMessage(0), 1000 / 30);
  if (e.data === 'stop' && timer) { clearInterval(timer); timer = null; }
};
