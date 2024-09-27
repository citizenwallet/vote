"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/services/cw/utils";
import { Loader2, QrCodeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useZxing } from "react-zxing";

export default function VoterPage({
  siteBaseUrl,
  address,
}: {
  siteBaseUrl: string;
  address: string;
}) {
  const hasDetectedRef = useRef(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const { ref } = useZxing({
    paused: !showScanner || scanned,
    onDecodeResult(result) {
      handleScan(result.getText());
    },
    onError(error) {
      handleError(error);
    },
  });

  const handleScan = (rawValue: string) => {
    console.log("detectedCodes", rawValue);
    if (rawValue.length === 0) {
      return;
    }

    if (!rawValue || !rawValue.startsWith(siteBaseUrl)) {
      return;
    }

    if (hasDetectedRef.current) {
      return;
    }

    hasDetectedRef.current = true;

    setScanned(true);

    router.push(`${rawValue}?voter=${address}`);
  };

  const handleError = (error: unknown) => {
    console.error(error);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
      <div className="w-48 h-48 bg-gray-400 rounded-full flex flex-col items-center justify-center relative mb-8 shadow-lg animate-voter-id">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            id="curve-top"
            fill="transparent"
            d="M 20,45 a 30,30 0 1,1 60,0"
          />
          <path
            id="curve-bottom"
            fill="transparent"
            d="M 20,75 a 30,18 0 1,0 60,0"
          />
          <text className="fill-white text-xs">
            <textPath
              xlinkHref="#curve-top"
              startOffset="50%"
              textAnchor="middle"
            >
              VOTER ID
            </textPath>
          </text>
          <text className="fill-white" style={{ fontSize: 8 }}>
            <textPath
              xlinkHref="#curve-bottom"
              startOffset="50%"
              textAnchor="middle"
            >
              {shortenAddress(address)}
            </textPath>
          </text>
        </svg>
      </div>

      {showScanner ? (
        <Button
          onClick={() => setShowScanner(false)}
          className="text-white font-bold py-2 px-4"
        >
          Scanning... <Loader2 className="w-4 h-4 ml-2 animate-spin" />
        </Button>
      ) : (
        <Button
          onClick={() => setShowScanner(true)}
          className="text-white font-bold py-2 px-4"
        >
          <QrCodeIcon className="w-4 h-4 mr-2" /> Scan to join
        </Button>
      )}

      {scanned && (
        <div className="mt-4 w-64 h-64 rounded-lg bg-gray-200 flex justify-center items-center">
          <div className="text-xl font-bold">Scanned</div>
        </div>
      )}

      <div className="mt-4 rounded-lg overflow-hidden">
        <video className="w-64 h-64" ref={ref} />
      </div>
    </div>
  );
}
