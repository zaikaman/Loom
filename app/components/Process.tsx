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
    title: "Connect",
    description:
      "Link your Foru.ms backend or compatible data source. Loom seamlessly integrates with your existing threaded discussions, requiring no migration or complex server setup.",
  },
  {
    number: "02",
    title: "Curate",
    description:
      "Select the threads you want to feature on your public roadmap. Loom automatically aggregates key details, allowing you to filter out noise and focus on what matters.",
  },
  {
    number: "03",
    title: "Design",
    description:
      "Customize the look and feel of your timeline. Choose from our premium themes, adjust colors to match your brand, and configure display options for a cohesive experience.",
  },
  {
    number: "04",
    title: "Publish",
    description:
      "With a single click, publish your interactive roadmap. Share the link with your community, embed it on your site, or use it as your primary changelog destination.",
  },
  {
    number: "05",
    title: "Engage",
    description:
      "Enable public voting and feedback. Let your users upvote features they want most and discuss details directly in the timeline threads, keeping everything centralized.",
  },
  {
    number: "06",
    title: "Update",
    description:
      "As you ship features, update their status to 'In Progress' or 'Shipped'. Your timeline evolves automatically, keeping your community informed and excited about your progress.",
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
