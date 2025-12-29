"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";
import ProcessCard from "./ProcessCard";

type ProcessItem = {
  number: string;
  title: string;
  description: string;
};

const processItems: ProcessItem[] = [
  {
    number: "01",
    title: "Create",
    description:
      "Start a new roadmap in seconds. Loom automatically sets up the underlying thread structure and permissions, giving you a clean slate to build upon.",
  },
  {
    number: "02",
    title: "Add Features",
    description:
      "Draft new features or import them in bulk. Use Magic Expand to instantly turn simple one-liners into comprehensive product requirements documents.",
  },
  {
    number: "03",
    title: "Collaborate",
    description:
      "Invite your team to the roadmap. Assign Owner, Editor, or Viewer roles to manage who can create features, edit content, and change statuses.",
  },
  {
    number: "04",
    title: "Engage",
    description:
      "Share your roadmap publicly. Enable users to vote on features they want most and discuss implementation details directly in the feature threads.",
  },
  {
    number: "05",
    title: "Analyze",
    description:
      "Let AI be your PM. The Triage System automatically analyzes incoming feedback, classifying sentiment and assigning Impact/Effort scores to help you prioritize.",
  },
  {
    number: "06",
    title: "Celebrate",
    description:
      "Ship with style. When you move a feature to 'Shipped', Loom triggers valid confetti celebrations, keeping your community excited about progress.",
  },
];

export default function Process({ className }: { className?: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <div
      className={cn(
        "content-stretch flex flex-col gap-[30px] items-start px-[100px] max-xl:px-[60px] max-sm:px-[30px] py-0 relative w-full max-w-[1440px] mx-auto",
        className
      )}
      data-name="Process block"
    >
      {processItems.map((item, index) => (
        <ProcessCard
          key={index}
          number={item.number}
          title={item.title}
          description={item.description}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
          className="mx-[3px]"
        />
      ))}
    </div>
  );
}
