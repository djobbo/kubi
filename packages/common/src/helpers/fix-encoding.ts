export function fixEncoding(originalString: string) {
    const str = originalString.trim()
    const latinBytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      latinBytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(latinBytes);
  }