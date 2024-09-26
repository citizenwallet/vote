"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  WifiIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  RecycleIcon,
  Loader2,
} from "lucide-react";
import { generateVoter } from "@/services/poll";
import { useAccount } from "@/services/cw/account";
import { Config } from "@/services/cw/config";

export default function NFCScanner({
  siteBaseUrl,
  contractAddress,
  config,
}: {
  siteBaseUrl: string;
  contractAddress: string;
  config: Config;
}) {
  const writingRef = useRef(false);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [voters, setVoters] = useState<string[]>([]);

  const account = useAccount(
    config.node.url,
    config.erc4337.account_factory_address
  );

  useEffect(() => {
    // Check if NFC is available
    if ("NDEFReader" in window) {
      setNfcAvailable(true);
    } else {
      setNfcAvailable(false);
      setError("NFC is not available on this device.");
    }
  }, []);

  const handleNFCData = async ({
    message,
    serialNumber,
  }: {
    message: NDEFMessage;
    serialNumber: string;
  }) => {
    if (writingRef.current || !account) return;
    setUrl(null);

    const voter = generateVoter(contractAddress, account.address, serialNumber);
    setUrl(`${siteBaseUrl}/voter/${voter}`);
  };

  const handleStartScanner = async () => {
    try {
      const ndef = new NDEFReader();
      console.log("Starting scanner...", ndef.scan);
      await ndef.scan();

      console.log("Scan started successfully.");
      ndef.onreadingerror = () => {
        console.log("Cannot read data from the NFC tag. Try another one?");
      };

      ndef.onreading = (event) => {
        console.log("NDEF message read.");
        console.log(event);
        handleNFCData(event);
      };

      setScanning(true);
    } catch (error) {
      console.log(`Error! Scan failed to start: ${error}.`);
      setError(`Scanner failed to start: ${error}.`);
    }
  };

  const handleStopScanner = async () => {
    const ndef = new NDEFReader();
    ndef.onreading = () => {};
    ndef.onreadingerror = () => {};

    setScanning(false);
  };

  const handleWrite = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }

    if (writingRef.current) return;
    writingRef.current = true;

    try {
      const ndef = new NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: url }] });
      setUrl(null);
      setStatus("URL written successfully!");
      setError("");

      setVoters([...voters, url.replace(`${siteBaseUrl}/voter/`, "")]);

      setTimeout(() => {
        setStatus("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setError("Failed to write URL to NFC tag. Make sure a tag is in range.");
    }

    writingRef.current = false;
  };

  const handleCopyVoters = () => {
    navigator.clipboard.writeText(voters.join(","));
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Configure NFC Tags</h1>

      {nfcAvailable === null ||
        (!account && <div>Checking NFC availability...</div>)}

      {nfcAvailable === false && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {nfcAvailable === true && account && (
        <>
          {!scanning ? (
            <Button onClick={handleStartScanner} className="w-full">
              <WifiIcon className="mr-2 h-4 w-4" /> Start Scanner
            </Button>
          ) : (
            <Button onClick={handleStopScanner} className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
            </Button>
          )}

          {url !== null && (
            <>
              <Button onClick={handleWrite} className="w-full">
                <WifiIcon className="mr-2 h-4 w-4" /> Write URL
              </Button>
              <Button onClick={() => setUrl(null)} className="w-full">
                <RecycleIcon className="mr-2 h-4 w-4" /> Clear URL
              </Button>
            </>
          )}

          {url && (
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="break-all">{url}</AlertDescription>
            </Alert>
          )}

          {status && (
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {voters.length > 0 && (
            <div>
              <h2 className="text-lg font-bold">Voters</h2>

              {voters.map((voter) => (
                <p key={voter} className="text-sm">
                  {voter}
                </p>
              ))}

              <div className="w-full flex justify-center items-center">
                <Button className="mt-2" onClick={handleCopyVoters}>
                  Copy Voters
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
