"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Poll } from "@/services/poll";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const barColors = [
  "#FF8C9E", // Stronger Pink
  "#7FFF8E", // Stronger Green
  "#7FBFFF", // Stronger Blue
  "#FFFF7F", // Stronger Yellow
  "#FFB77F", // Stronger Peach
  "#C77FE2", // Stronger Lavender
  "#7FE7E7", // Stronger Cyan
  "#FF7FFF", // Stronger Magenta
  "#BFEA7F", // Stronger Lime
  "#FFA07F", // Stronger Salmon
  "#7FD17F", // Stronger Mint Green
  "#9D9DFF", // Stronger Periwinkle
];

export default function PollDisplay({
  poll,
  votes,
  totalVotes = 0,
}: {
  poll: Poll;
  votes: number[];
  totalVotes: number;
}) {
  const [currentUrl, setCurrentUrl] = useState("");

  const chartConfig = {
    value: {
      label: "Votes",
      color: barColors[Math.floor(Math.random() * barColors.length)],
    },
  } satisfies ChartConfig;

  console.log(chartConfig);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const joinUrl = `${currentUrl}/join`;

  const chartData = poll.options.map((option, index) => ({
    name: `${option.emoji} ${option.name}`,
    total: votes[index],
  }));

  console.log(chartData);
  console.log(poll.options);

  return (
    <div className="container mx-auto p-4 max-w-6xl flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">
        {poll.emoji} {poll.name}
      </h1>
      <p className="mb-6">{poll.description}</p>

      <div className="lg:flex lg:space-x-6">
        <div className="lg:w-1/2 mb-6 lg:mb-0">
          <Card className="p-4 h-80 w-80 flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold mb-4">Join the Poll</h2>
            <div className="flex justify-center">
              <QRCodeSVG value={joinUrl} size={200} />
            </div>
            {/* <p className="mt-4 text-center">{joinUrl}</p> */}
          </Card>
        </div>
      </div>

      <Card className="mt-6 p-4 flex flex-col justify-start items-center">
        <h2 className="text-xl font-semibold mb-4">Results ({votes.length})</h2>
        <div className="max-w-6xl w-full flex">
          <ScrollArea className="h-[300px]">
            <ul>
              {/* {votes.map((vote, index) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">
                    Option {vote.optionIndex + 1}:
                  </span>{" "}
                  {poll.options[vote.optionIndex].emoji}{" "}
                {poll.options[vote.optionIndex].name} - Votes: {vote.votes}{" "}
                  (Total votes: {vote.totalVotes})
                </li>
              ))} */}
            </ul>
          </ScrollArea>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={20}
              />
              <YAxis tickLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="#2563eb" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col p-4">
          {poll.options.map((option, index) => (
            <p key={index}>
              {option.emoji} {option.name}: {votes[index]} (
              {Math.round((votes[index] / totalVotes) * 100)}
              %)
            </p>
          ))}
          <p>Total Votes: {totalVotes}</p>
        </div>
      </Card>
    </div>
  );
}
