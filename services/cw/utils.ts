import { hexlify, toUtf8Bytes } from "ethers";

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
