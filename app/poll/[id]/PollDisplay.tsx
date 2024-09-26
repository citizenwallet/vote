"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
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
  siteBaseUrl,
  pollId,
  poll,
  votes,
  totalVotes = 0,
}: {
  siteBaseUrl: string;
  pollId: string;
  poll: Poll;
  votes: number[];
  totalVotes: number;
}) {
  const chartConfig = {
    value: {
      label: "Votes",
      color: barColors[Math.floor(Math.random() * barColors.length)],
    },
  } satisfies ChartConfig;

  const joinUrl = `${siteBaseUrl}/poll/${pollId}/vote`;

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

      <div className="lg:flex lg:space-x-6 w-full">
        <div className="lg:w-1/2 mb-6 lg:mb-0">
          <Card className="p-4 h-full flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold mb-4">Join the Poll</h2>
            <div className="flex justify-center">
              <QRCodeSVG value={joinUrl} size={300} />
            </div>
          </Card>
        </div>

        <div className="lg:w-1/2">
          <Card className="p-4 h-full flex flex-col justify-start items-center">
            <h2 className="text-xl font-semibold mb-4">
              Results ({votes.length})
            </h2>
            <div className="w-full flex">
              <ChartContainer
                config={chartConfig}
                className="min-h-[400px] w-full"
              >
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    fontSize={14}
                  />
                  <YAxis tickLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="#2563eb" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="flex flex-col p-4 w-full">
              {poll.options.map((option, index) => (
                <p key={index} className="text-lg">
                  {option.emoji} {option.name}: {votes[index]} (
                  {Math.round((votes[index] / totalVotes) * 100)}
                  %)
                </p>
              ))}
              <p className="text-xl font-bold mt-2">
                Total Votes: {totalVotes}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
