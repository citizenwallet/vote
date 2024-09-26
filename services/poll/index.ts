import { getBytes } from "ethers";
import { abi as voteAbi } from "@/abi/Vote.json";
import { Interface } from "ethers";
import { formatStringToBytes } from "../cw/utils";

const voteInterface = new Interface(voteAbi);

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

export const createPollCallData = (poll: Poll) =>
  getBytes(
    voteInterface.encodeFunctionData("createPoll", [
      {
        name: formatStringToBytes(poll.name),
        emoji: formatStringToBytes(poll.emoji),
        description: formatStringToBytes(poll.description),
        options: poll.options.map((option) =>
          formatStringToBytes(`:${option.emoji}:${option.name}`)
        ),
      },
    ])
  );
