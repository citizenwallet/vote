import {
  getBytes,
  hexlify,
  keccak256,
  toUtf8Bytes,
  toUtf8String,
} from "ethers";

const padBytesWithSpace = (bytes: Uint8Array, length: number): Uint8Array => {
  const spaceByte = new TextEncoder().encode(" ");
  while (bytes.length < length) {
    bytes = new Uint8Array([...Array.from(spaceByte), ...Array.from(bytes)]);
  }
  return bytes;
};

export const formatStringToBytes32 = (str: string): string => {
  return hexlify(padBytesWithSpace(toUtf8Bytes(str), 32));
};

export const formatStringToBytes = (str: string): string => {
  return hexlify(toUtf8Bytes(str));
};

export const formatBytes32ToString = (bytes32: string): string => {
  const bytes = getBytes(bytes32);
  // Remove leading space characters (ASCII code 32)
  const trimmedBytes = bytes.slice(bytes.findIndex((b: number) => b !== 32));
  return toUtf8String(trimmedBytes);
};

export const formatBytesToString = (bytes: string): string => {
  return toUtf8String(getBytes(bytes));
};

export function stringToKeccak256(input: string): string {
  // Convert the string to bytes
  const bytes = toUtf8Bytes(input);

  // Compute the keccak256 hash of the bytes
  const hash = keccak256(bytes);

  return hash;
}
