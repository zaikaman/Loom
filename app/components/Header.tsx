import { cn } from "../lib/utils";
import Button from "./Button";
import HeaderIllustration from "@/app/assets/illustrations/header.svg";

export default function Header({ className }: { className?: string }) {
  return (
    <main
      className={cn(
        "flex items-center max-md:flex-col justify-between gap-[20px] px-[100px] max-xl:px-[60px] max-sm:px-[30px] py-0 relative w-full max-w-[1440px] mx-auto",
        className
      )}
    >
      <div className="flex flex-col gap-[35px] max-xl:gap-[25px] items-start relative shrink-0 flex-1 pb-[34px] max-md:pb-0 max-w-[600px] max-md:max-w-none">
        <h1 className="font-medium relative shrink-0 text-[60px]/[normal] max-xl:text-[48px]/[1] whitespace-pre-wrap">
          The Headless Product Roadmap & Changelog Tool
        </h1>
        <svg
          viewBox="0 0 601 515"
          className="hidden max-md:block mx-auto max-w-[480px] -mb-[25px]"
        >
          <use href="#header-illustration" />
        </svg>
        <p className="font-normal relative shrink-0 text-[20px]/[28px] max-xl:text-[16px]/[24px] max-w-[550px] max-md:max-w-none whitespace-pre-wrap">
          Loom transforms threaded discussions into beautiful, interactive timelines.
          Perfect for indie makers, startups, and open-source teams who want to showcase progress with a premium "wow" factor.
        </p>
        <Button
          variant="primary"
          className="py-[19px] pr-[36px] max-md:w-full justify-center"
        >
          Get Started
        </Button>
      </div>
      <div className="relative shrink-0 flex-1 max-md:hidden">
        <HeaderIllustration
          className="block max-w-full h-auto ml-auto"
          width={601}
          height={515}
          id="header-illustration"
        />
      </div>
    </main>

  );
}
