"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/services/cw/account";
import { Config } from "@/services/cw/config";
import { useBundler } from "@/services/cw/bundler";
import { hexlify, JsonRpcProvider } from "ethers";
import { Loader2 } from "lucide-react";
import {
  addTokenCallData,
  generatePollToken,
  hasAuthorizedPollToken,
} from "@/services/poll";

interface Voter {
  address: string;
  authorized: boolean;
}

export default function TokenAuthorizer({
  config,
  contractAddress,
}: {
  config: Config;
  contractAddress: string;
}) {
  const [checking, setChecking] = useState(false);
  const [authorizing, setAuthorizing] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [items, setItems] = useState<Voter[]>([]);

  const account = useAccount(
    config.node.url,
    config.erc4337.account_factory_address
  );

  const bundler = useBundler(config);

  const provider = useMemo(() => {
    return new JsonRpcProvider(config.node.url);
  }, [config.node.url]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const parseItems = () => {
    const parsedItems = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const items = parsedItems.map((item) => ({
      address: item,
      authorized: false,
    }));

    setItems(items);
    checkTokenAuthorized(items);
  };

  const checkTokenAuthorized = async (voters: Voter[]) => {
    if (checking || !account) return;
    setChecking(true);
    try {
      for (const voter of voters) {
        const token = generatePollToken(
          contractAddress,
          account.address,
          voter.address
        );

        const authorized = await hasAuthorizedPollToken(
          provider,
          contractAddress,
          account.address,
          token
        );
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.address === voter.address ? { ...item, authorized } : item
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error(error);
    }

    setChecking(false);
  };

  const handleAuthorize = async (item: string) => {
    if (!account) return;
    try {
      setAuthorizing(item);
      // Placeholder for item action
      console.log(`Action performed on item: ${item}`);
      const token = generatePollToken(contractAddress, account.address, item);

      const data = addTokenCallData(token);

      const tx = await bundler.submit(
        account.signer,
        account.address,
        contractAddress,
        hexlify(data),
        {}
      );

      console.log("tx", tx);

      const receipt = await bundler.awaitSuccess(tx);
      if (receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      console.log("receipt", receipt);

      setItems((prevItems) =>
        prevItems.map((v) =>
          v.address === item ? { ...v, authorized: true } : v
        )
      );
    } catch (error) {
      console.error(error);
    }

    setAuthorizing(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Token Authorizer</h1>
      <Textarea
        placeholder="Paste comma-separated values here"
        value={input}
        disabled={checking}
        onChange={handleInputChange}
        className="min-h-[100px]"
      />
      <Button onClick={parseItems} disabled={checking}>
        Parse Voters{" "}
        {checking && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Button>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-100 rounded"
          >
            <span>{item.address}</span>
            {!item.authorized ? (
              <Button
                onClick={() => handleAuthorize(item.address)}
                disabled={authorizing === item.address}
                size="sm"
              >
                Authorize{" "}
                {authorizing === item.address && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            ) : (
              <p>Authorized</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
