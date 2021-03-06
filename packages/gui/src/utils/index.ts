/**
 * Pad left, default with a '0'
 *
 * @see http://stackoverflow.com/a/10073788/319711
 * @param {(string | number)} n
 * @param {number} width
 * @param {string} [z='0']
 * @returns
 */
export const padLeft = (n: string | number, width: number, z: string = '0') => {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/** Convert a date to HH:mm */
export const formatTime = (t: Date, includeSeconds = true) => includeSeconds
  ? `${padLeft(t.getHours(), 2)}:${padLeft(t.getMinutes(), 2)}:${padLeft(t.getSeconds(), 2)}`
  : `${padLeft(t.getHours(), 2)}:${padLeft(t.getMinutes(), 2)}`;
