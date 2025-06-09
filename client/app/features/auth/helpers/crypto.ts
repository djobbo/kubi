import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

export const generateIdFromEntropySize = (size: number) => {
  const buffer = crypto.getRandomValues(new Uint8Array(size));
  return encodeBase32LowerCaseNoPadding(buffer);
};
