import { keccak256, toBeArray } from "ethers";

function serialToBigInt(serial: string): bigint {
  // Remove colons to get a clean hexadecimal string
  const hexString = serial.replace(/:/g, "");

  // Convert the hexadecimal string to bigint
  const result = BigInt(`0x${hexString}`);

  return result;
}

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param code - The code as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getSerialHash(serialNumber: string): string {
  const parsedSerialNumber = serialToBigInt(serialNumber);
  const hashedSerialNumber = keccak256(toBeArray(parsedSerialNumber));

  return hashedSerialNumber;
}
