"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { Trash2, GripVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { Poll } from "@/services/poll";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type PollOption = {
  id: string;
  emoji: string;
  name: string;
};

export default function CreatePoll({
  onSubmit,
}: {
  onSubmit: (poll: Poll) => Promise<string>;
}) {
  const [pollName, setPollName] = useState("");
  const [pollEmoji, setPollEmoji] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([]);
  const [newOptionEmoji, setNewOptionEmoji] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [showPollEmojiPicker, setShowPollEmojiPicker] = useState(false);
  const [showOptionEmojiPicker, setShowOptionEmojiPicker] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionName, setEditingOptionName] = useState("");

  const addOption = () => {
    if (newOptionName) {
      setOptions([
        ...options,
        {
          id: Date.now().toString(),
          emoji: newOptionEmoji || "⚪️",
          name: newOptionName,
        },
      ]);
      setNewOptionEmoji("");
      setNewOptionName("");
    }
  };

  const removeOption = (id: string) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const newOptions = Array.from(options);
    const [reorderedItem] = newOptions.splice(result.source.index, 1);
    newOptions.splice(result.destination.index, 0, reorderedItem);

    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    // Here you would typically send the poll data to your backend
    console.log({ pollName, pollEmoji, pollDescription, options });
    // const hash = await onSubmit({
    //   name: pollName,
    //   emoji: pollEmoji,
    //   description: pollDescription,
    //   options,
    // });
    // console.log("hash", hash);
  };

  const handlePollEmojiSelect = (emojiObject: EmojiClickData) => {
    setPollEmoji(emojiObject.emoji);
    setShowPollEmojiPicker(false);
  };

  const handleOptionEmojiSelect = (
    emojiObject: EmojiClickData,
    optionId?: string
  ) => {
    if (optionId) {
      setOptions(
        options.map((option) =>
          option.id === optionId
            ? { ...option, emoji: emojiObject.emoji }
            : option
        )
      );
    } else {
      setNewOptionEmoji(emojiObject.emoji);
    }
    setShowOptionEmojiPicker(false);
  };

  const startEditingOption = (option: PollOption) => {
    setEditingOptionId(option.id);
    setEditingOptionName(option.name);
  };

  const saveEditingOption = () => {
    if (editingOptionId) {
      setOptions(
        options.map((option) =>
          option.id === editingOptionId
            ? { ...option, name: editingOptionName }
            : option
        )
      );
      setEditingOptionId(null);
      setEditingOptionName("");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-teal-700">
        Create a New Poll
      </h1>

      <div className="space-y-4 mb-8">
        <div>
          <Label htmlFor="pollName">Poll Name</Label>
          <Input
            id="pollName"
            value={pollName}
            onChange={(e) => setPollName(e.target.value)}
            placeholder="Enter poll name"
          />
        </div>

        <div>
          <Label htmlFor="pollEmoji">Poll Emoji</Label>
          <div className="flex items-center">
            <Popover
              open={showPollEmojiPicker}
              onOpenChange={setShowPollEmojiPicker}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPollEmojiPicker(true)}
                >
                  {pollEmoji ? (
                    <span className="text-xl">{pollEmoji}</span>
                  ) : (
                    <Smile className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <EmojiPicker
                  lazyLoadEmojis
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={handlePollEmojiSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="pollDescription">Poll Description</Label>
          <Textarea
            id="pollDescription"
            value={pollDescription}
            onChange={(e) => setPollDescription(e.target.value)}
            placeholder="Describe your poll"
            rows={3}
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-teal-700">
        Poll Options
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex space-x-2">
          <div className="flex items-center">
            <Popover
              open={showOptionEmojiPicker}
              onOpenChange={setShowOptionEmojiPicker}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOptionEmojiPicker(true)}
                >
                  {newOptionEmoji ? (
                    <span className="text-xl">{newOptionEmoji}</span>
                  ) : (
                    <Smile className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <EmojiPicker
                  lazyLoadEmojis
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={(emojiObject) =>
                    handleOptionEmojiSelect(emojiObject)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <Input
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newOptionName.trim() !== "") {
                addOption();
              }
            }}
            placeholder="Option name"
            className="flex-grow"
          />
          <Button onClick={addOption} className="bg-teal-500 hover:bg-teal-600">
            Add
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {options.map((option, index) => (
                  <Draggable
                    key={option.id}
                    draggableId={option.id}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-3 mb-2 flex items-center"
                      >
                        <span className="mr-2">
                          <GripVertical className="text-gray-400" />
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mr-2"
                            >
                              <span className="text-xl">{option.emoji}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <EmojiPicker
                              lazyLoadEmojis
                              emojiStyle={EmojiStyle.NATIVE}
                              onEmojiClick={(emojiObject) =>
                                handleOptionEmojiSelect(emojiObject, option.id)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        {editingOptionId === option.id ? (
                          <Input
                            value={editingOptionName}
                            onChange={(e) =>
                              setEditingOptionName(e.target.value)
                            }
                            onBlur={saveEditingOption}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEditingOption();
                              }
                            }}
                            className="flex-grow mr-2"
                          />
                        ) : (
                          <span className="flex-grow">{option.name}</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditingOption(option)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Button
        onClick={handleCreatePoll}
        className="w-full bg-teal-500 hover:bg-teal-600"
      >
        Create Poll
      </Button>
    </div>
  );
}
