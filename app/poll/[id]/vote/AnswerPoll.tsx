"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVoteEventTopic, Poll, voteCallData } from "@/services/poll";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";
import { useAccount } from "@/services/cw/account";
import { Config } from "@/services/cw/config";
import { useBundler } from "@/services/cw/bundler";
import { hexlify, JsonRpcProvider } from "ethers";
import { toast } from "@/hooks/use-toast";

export default function Component({
  pollId,
  poll: { name, emoji, description, options },
  hasVoted = false,
  config,
  voter,
  voteContractAddress,
}: {
  pollId: string;
  poll: Poll;
  hasVoted: boolean;
  config: Config;
  voter: string;
  voteContractAddress: string;
}) {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  const account = useAccount(
    config.node.url,
    config.erc4337.account_factory_address
  );

  const bundler = useBundler(config);

  const handleOptionSelect = (index: number) => {
    if (!confirmed) {
      setSelectedOption(index);
    }
  };

  const handleConfirm = async () => {
    if (selectedOption === null || !account) {
      return;
    }

    setConfirmed(true);
    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      const callData = voteCallData(pollId, voter, selectedOption);

      await bundler.submit(
        account.signer,
        account.address,
        voteContractAddress,
        hexlify(callData),
        {
          topic: getVoteEventTopic(),
          pollId,
          optionIndex: `${selectedOption}`,
        }
      );

      // TODO: fix bug with ws disconnecting when others connect
      // router.push(`/poll/${pollId}`);
      setSuccess(true);
      return;
    } catch (error) {
      console.error("Error confirming vote", error);
      toast({
        title: "Error confirming vote",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
    setConfirmed(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-2xl font-bold">Vote submitted successfully</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {emoji} {name}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index ? "default" : "outline"}
                className={`w-full justify-start text-left ${
                  confirmed && selectedOption === index
                    ? "bg-green-500 hover:bg-green-500"
                    : ""
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={confirmed}
              >
                <span className="mr-2 text-xl">{option.emoji}</span>
                {option.name}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          {!hasVoted && (
            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={selectedOption === null || confirmed}
            >
              {confirmed ? "Submitting..." : "Confirm Choice"}
              {confirmed && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </Button>
          )}
          {hasVoted && <div>You have already voted on this poll</div>}
        </CardFooter>
      </Card>
    </div>
  );
}
