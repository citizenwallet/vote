import { ethers, getBytes } from "ethers";
import { abi as accountContractAbi } from "@/abi/ModuleManager.json";
import { abi as voteContractAbi } from "@/abi/Vote.json";
import { PollOption } from "../poll";

const accountInterface = new ethers.Interface(accountContractAbi);
const voteInterface = new ethers.Interface(voteContractAbi);

export const createPollCallData = (
  voteContractAddress: string,
  pollName: string,
  pollEmoji: string,
  pollDescription: string,
  pollOptions: PollOption[]
) =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execTransactionFromModule", [
      voteContractAddress,
      BigInt(0),
      voteInterface.encodeFunctionData("createPoll", [
        getBytes(pollName),
        getBytes(pollEmoji),
        getBytes(pollDescription),
        pollOptions.map((option) =>
          getBytes(`:${option.emoji}:${option.name}`)
        ),
      ]),
    ])
  );
