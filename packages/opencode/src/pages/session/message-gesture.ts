export function shouldMarkBoundaryGesture(input: {
  delta: number;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  const max = Math.max(0, input.scrollHeight - input.clientHeight);
  if (max <= 0) return true;
  if (input.delta < 0) return input.scrollTop <= 0;
  if (input.delta > 0) return input.scrollTop >= max;
  return false;
}

export function normalizeWheelDelta(input: {
  deltaY: number;
  deltaMode: number;
  rootHeight: number;
}) {
  if (!input.deltaY) return 0;
  if (input.deltaMode === 1) return input.deltaY * 16;
  if (input.deltaMode === 2) return input.deltaY * input.rootHeight;
  return input.deltaY;
}
