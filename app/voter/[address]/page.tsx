import Voter from "./Voter";

export default function Page({ params }: { params: { address: string } }) {
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL;
  if (!siteBaseUrl) {
    return <div>Site base URL not found</div>;
  }

  return <Voter address={params.address} siteBaseUrl={siteBaseUrl} />;
}
