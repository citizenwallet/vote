import Link from "next/link";
import { ArrowRight, Shield, Users, CheckCircle, ChartBar } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <ChartBar className="h-6 w-6 text-teal-500" />
          <span className="ml-2 text-2xl font-bold text-teal-700">
            AnonyPoll
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-teal-700"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-teal-700"
            href="#"
          >
            How It Works
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-teal-700"
            href="#"
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-teal-700">
                  Anonymous In-Person Polls
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Create verifiable, on-chain polls for any topic. Use NFC tags
                  to ensure unique voter identification and maintain anonymity.
                </p>
              </div>
              <Link href="/create">
                <Button className="bg-teal-500 text-white hover:bg-teal-600">
                  Create a New Poll
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Shield className="h-12 w-12 text-teal-500" />
                <h2 className="text-xl font-bold text-teal-700">
                  Anonymous Voting
                </h2>
                <p className="text-gray-600">
                  Ensure voter privacy with our advanced anonymity protocols,
                  keeping individual votes confidential.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Users className="h-12 w-12 text-teal-500" />
                <h2 className="text-xl font-bold text-teal-700">
                  NFC Identification
                </h2>
                <p className="text-gray-600">
                  Use NFC tags to uniquely identify voters, preventing double
                  voting while maintaining anonymity.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <CheckCircle className="h-12 w-12 text-teal-500" />
                <h2 className="text-xl font-bold text-teal-700">
                  On-Chain Verification
                </h2>
                <p className="text-gray-600">
                  All poll results are recorded on-chain, ensuring transparency
                  and verifiability of the voting process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-teal-200">
        <p className="text-xs text-gray-600">
          © 2023 AnonyPoll. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-600"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-600"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
