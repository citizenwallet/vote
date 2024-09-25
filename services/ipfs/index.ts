"use server";

import { PinataSDK } from "pinata-web3";
import { Poll } from "../poll";

class IPFSService {
  private ipfsGateway: string;
  private pinata: PinataSDK;

  constructor(apiUrl: string, apiKey: string, ipfsGateway: string) {
    this.ipfsGateway = ipfsGateway;
    this.pinata = new PinataSDK({
      pinataJwt: apiKey,
      pinataGateway: apiUrl,
    });
  }

  async uploadFile(file: File): Promise<string> {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      throw new Error("File size exceeds the maximum limit of 10MB");
    }

    const upload = await this.pinata.upload.file(file);
    return upload.IpfsHash;
  }

  async uploadJSON(json: Record<string, unknown>): Promise<string> {
    const jsonString = JSON.stringify(json);
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    if (new Blob([jsonString]).size > maxSizeInBytes) {
      throw new Error("JSON size exceeds the maximum limit of 10MB");
    }

    const upload = await this.pinata.upload.json(json);
    return upload.IpfsHash;
  }

  async unpinFile(hash: string): Promise<boolean> {
    try {
      await this.pinata.unpin([hash]);
      return true;
    } catch (error) {
      console.error(`Failed to unpin file with hash ${hash}:`, error);
      return false;
    }
  }

  async getJSON(hash: string): Promise<Poll | null> {
    try {
      const response = await fetch(
        `${hash.replace("ipfs://", `${this.ipfsGateway}/`)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch JSON");
      }

      const poll = (await response.json()) as Poll;

      return poll;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default IPFSService;
