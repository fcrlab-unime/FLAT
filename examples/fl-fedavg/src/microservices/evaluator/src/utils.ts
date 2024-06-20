export function Float32Concat(first: Float32Array, second: Float32Array) {
  var firstLength = first.length,
      result = new Float32Array(firstLength + second.length);

  result.set(first);
  result.set(second, firstLength);
  return result;
}