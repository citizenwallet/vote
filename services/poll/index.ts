export type PollOption = {
  id: string;
  emoji: string;
  name: string;
};

export interface Poll {
  name: string;
  emoji: string;
  description: string;
  options: PollOption[];
}
