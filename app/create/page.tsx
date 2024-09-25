import IPFSService from "@/services/ipfs";
import CreatePoll from "./CreatePoll";
import { Poll } from "@/services/poll";

const ipfsService = new IPFSService(
  process.env.PINATA_BASE_URL!,
  process.env.PINATA_API_KEY!,
  process.env.NEXT_PUBLIC_IPFS_GATEWAY!
);

export default function Page() {
  const createPoll = async (poll: Poll) => {
    "use server";

    if (poll.options.length === 0) {
      throw new Error("No options defined");
    }

    const hash = await ipfsService.uploadJSON(
      poll as unknown as Record<string, unknown>
    );
    console.log("hash", hash);
    return hash;
  };

  return <CreatePoll onSubmit={createPoll} />;
}
