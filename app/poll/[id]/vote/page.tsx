import { readCommunityConfig } from "@/services/cw/config";
import AnswerPoll from "./AnswerPoll";
import { JsonRpcProvider } from "ethers";
import {
  generatePollToken,
  getPollDetails,
  getPollOwner,
  getPollVotes,
  hasPollTokenVoted,
  Poll,
} from "@/services/poll";

export default async function Page({
  params: { id },
  searchParams: { voter },
}: {
  params: { id: string };
  searchParams: { voter: string };
}) {
  const community = readCommunityConfig();
  if (!community) {
    return <div>Community not found</div>;
  }

  const voteContractAddress = process.env.VOTE_CONTRACT_ADDRESS;
  if (!voteContractAddress) {
    return <div>Vote contract address not found</div>;
  }

  const provider = new JsonRpcProvider(community.node.url);

  const pollDetails: Poll = await getPollDetails(
    provider,
    voteContractAddress,
    id
  );

  if (!pollDetails) {
    return <div>Poll not found</div>;
  }

  const pollOwner = await getPollOwner(provider, voteContractAddress, id);

  const token = generatePollToken(voteContractAddress, pollOwner, voter);

  const hasVoted = await hasPollTokenVoted(
    provider,
    voteContractAddress,
    id,
    token
  );

  return (
    <AnswerPoll
      pollId={id}
      poll={pollDetails}
      hasVoted={hasVoted}
      config={community}
      voter={voter}
      voteContractAddress={voteContractAddress}
    />
  );
}
