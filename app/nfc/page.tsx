import { readCommunityConfig } from "@/services/cw/config";
import ConfigureNFC from "./ConfigureNFC";

export default function Page() {
  const community = readCommunityConfig();
  if (!community) {
    return <div>Community not found</div>;
  }

  const voteContractAddress = process.env.VOTE_CONTRACT_ADDRESS;
  if (!voteContractAddress) {
    return <div>Vote contract address not found</div>;
  }

  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL;
  if (!siteBaseUrl) {
    return <div>Site base URL not found</div>;
  }

  return (
    <ConfigureNFC
      siteBaseUrl={siteBaseUrl}
      contractAddress={voteContractAddress}
      config={community}
    />
  );
}
