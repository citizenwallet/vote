import { readCommunityConfig } from "@/services/cw/config";
import TokenAuthorizer from "./AuthorizeTokens";
import { JsonRpcProvider } from "ethers";
import { getPollOwner } from "@/services/poll";

export default async function Tokens() {
  const community = readCommunityConfig();
  if (!community) {
    return <div>Community not found</div>;
  }

  const voteContractAddress = process.env.VOTE_CONTRACT_ADDRESS;
  if (!voteContractAddress) {
    return <div>Vote contract address not found</div>;
  }

  return (
    <TokenAuthorizer config={community} contractAddress={voteContractAddress} />
  );
}
