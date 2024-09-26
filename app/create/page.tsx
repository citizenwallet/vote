import CreatePoll from "./CreatePoll";
import { readCommunityConfig } from "@/services/cw/config";

export default function Page() {
  const community = readCommunityConfig();
  if (!community) {
    return <div>Community not found</div>;
  }

  const voteContractAddress = process.env.VOTE_CONTRACT_ADDRESS;
  if (!voteContractAddress) {
    return <div>Vote contract address not found</div>;
  }

  return (
    <CreatePoll
      voteContractAddress={voteContractAddress}
      community={community}
    />
  );
}
