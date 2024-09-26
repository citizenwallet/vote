import {
  Contract,
  getAddress,
  getBytes,
  JsonRpcApiProvider,
  solidityPackedKeccak256,
} from "ethers";
import voteAbi from "@/abi/Vote.json";
import { Interface } from "ethers";
import { formatBytesToString, formatStringToBytes } from "../cw/utils";
import { getSerialHash } from "../nfc";

const voteInterface = new Interface(voteAbi.abi);

export interface PollCreatedEvent {
  pollId: string;
  name: string;
  emoji: string;
}

export type PollOption = {
  id: string;
  emoji: string;
  name: string;
};

export interface Poll {
  name: string;
  emoji: string;
  description: string;
  options: PollOption[];
}

export const getPollDetails = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollId: string
): Promise<Poll> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  const pollName = formatBytesToString(await contract.pollName(pollId));
  const pollEmoji = formatBytesToString(await contract.pollEmoji(pollId));
  const pollDescription = formatBytesToString(
    await contract.pollDescription(pollId)
  );
  const pollOptions = await contract.pollOptions(pollId);

  const options = pollOptions.map(bytesToOption);

  return {
    name: pollName,
    emoji: pollEmoji,
    description: pollDescription,
    options,
  };
};

export const getPollOwner = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollId: string
): Promise<string> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  return await contract.pollOwners(pollId);
};

export const hasPollTokenVoted = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollId: string,
  token: string
): Promise<boolean> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  return await contract.pollTokens(pollId, token);
};

export const hasAuthorizedPollToken = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollOwner: string,
  token: string
): Promise<boolean> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  return await contract.pollOwnerAuthorizedTokens(pollOwner, token);
};

export const getPollVotes = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollId: string
): Promise<number[]> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  const pollVotes: bigint[] = await contract.pollVotes(pollId);
  return pollVotes.map((vote) => Number(vote));
};

export const getPollTotalVotes = async (
  provider: JsonRpcApiProvider,
  contractAddress: string,
  pollId: string
): Promise<number> => {
  const contract = new Contract(contractAddress, voteAbi.abi, provider);
  return await contract.pollTotalVotes(pollId);
};

export const createPollCallData = (poll: Poll) =>
  getBytes(
    voteInterface.encodeFunctionData("createPoll", [
      {
        name: formatStringToBytes(poll.name),
        emoji: formatStringToBytes(poll.emoji),
        description: formatStringToBytes(poll.description),
        options: poll.options.map((option) => optionToBytes(option)),
      },
    ])
  );

export const addTokenCallData = (token: string) =>
  getBytes(voteInterface.encodeFunctionData("addToken", [token]));

export const voteCallData = (
  pollId: string,
  voter: string,
  optionIndex: number
) =>
  getBytes(
    voteInterface.encodeFunctionData("vote", [pollId, voter, optionIndex])
  );

const optionToBytes = (option: PollOption) => {
  return formatStringToBytes(`:${option.emoji}:${option.name}`);
};

const bytesToOption = (bytes: string): PollOption => {
  const str = formatBytesToString(bytes);

  const split = str.split(":");

  const emoji = split[1];
  const name = split[2];
  return {
    id: bytes,
    emoji,
    name,
  };
};

export const generateVoter = (
  contractAddress: string,
  pollOwner: string,
  serialNumber: string
): string => {
  const hash = solidityPackedKeccak256(
    ["address", "address", "bytes32"],
    [contractAddress, pollOwner, getSerialHash(serialNumber)]
  );
  // Convert the last 20 bytes of the hash to an address
  const addressHex = hash.slice(-40); // Take the last 40 characters (20 bytes)
  // Format and checksum the address
  return getAddress(`0x${addressHex}`);
};

export const generatePollToken = (
  contractAddress: string,
  pollOwner: string,
  voter: string
) => {
  return solidityPackedKeccak256(
    ["address", "address", "address"],
    [contractAddress, pollOwner, voter]
  );
};

export const getVoteEventTopic = () => {
  // TODO: use the abi
  return "0xc11ee7452c2f2c2f4869b58e1d19ff51cf0580a58ec71e02064a290622511529";
};
