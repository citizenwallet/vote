"use client";

import { useRef, useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/services/cw/utils";
import { Loader2, QrCodeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VoterPage({
  siteBaseUrl,
  address,
}: {
  siteBaseUrl: string;
  address: string;
}) {
  const hasDetectedRef = useRef(false);
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length === 0) {
      return;
    }

    const rawValue = detectedCodes[0].rawValue;

    if (!rawValue || !rawValue.startsWith(siteBaseUrl)) {
      return;
    }

    if (hasDetectedRef.current) {
      return;
    }

    hasDetectedRef.current = true;

    router.push(`${rawValue}?voter=${address}`);
  };

  const handleError = (error: unknown) => {
    console.error(error);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
      <div className="w-48 h-48 bg-gray-400 rounded-full flex flex-col items-center justify-center relative mb-8">
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
              TOKEN
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

      {showScanner && (
        <div className="mt-4">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code"]}
            components={{ audio: false, zoom: false, torch: false }}
            classNames={{
              container: "w-64 h-64",
            }}
          />
        </div>
      )}
    </div>
  );
}
