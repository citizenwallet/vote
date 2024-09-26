import { getPollDetails, getPollVotes, Poll } from "@/services/poll";
import PollDisplay from "./PollDisplay";
import { readCommunityConfig } from "@/services/cw/config";
import { JsonRpcProvider } from "ethers";

export default async function PollPage({
  params: { id },
}: {
  params: { id: string };
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
  const pollVotes: number[] = await getPollVotes(
    provider,
    voteContractAddress,
    id
  );

  if (!pollDetails) {
    return <div>Poll not found</div>;
  }

  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL;
  if (!siteBaseUrl) {
    return <div>Site base URL not found</div>;
  }

  return (
    <PollDisplay
      siteBaseUrl={siteBaseUrl}
      pollId={id}
      poll={pollDetails}
      votes={pollVotes}
      totalVotes={pollVotes.reduce((acc, curr) => acc + curr, 0)}
      config={community}
      contractAddress={voteContractAddress}
    />
  );
}
