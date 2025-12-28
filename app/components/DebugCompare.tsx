"use client";
import homeDesign from "@/app/home-design-3x.png";
import Image from "next/image";
import { cn } from "../lib/utils";
import useLocalStorageState from "use-local-storage-state";

export default function DebugCompare() {
  const [isVisible, setIsVisible] = useLocalStorageState(
    "debug-compare-is-visible",
    {
      defaultValue: true,
    }
  );
  const [overDesign, setOverDesign] = useLocalStorageState(
    "debug-compare-over-design",
    {
      defaultValue: false,
    }
  );
  const [position, setPosition] = useLocalStorageState(
    "debug-compare-position",
    {
      defaultValue: "right",
    }
  );
  const [opacity, setOpacity] = useLocalStorageState("debug-compare-opacity", {
    defaultValue: 100,
  });
  return (
    <>
      <Image
        src={homeDesign}
        alt="home design"
        width={1440}
        className={cn(
          "h-auto block mx-auto absolute top-0 left-0 right-0 pointer-events-none min-w-[1440px] max-[1457px]:hidden",
          isVisible ? "opacity-100" : "opacity-0",
          overDesign ? "z-50" : "z-0"
        )}
        style={{ opacity: isVisible ? opacity / 100 : 0 }}
        loading="eager"
      />
      <div
        className={cn(
          "fixed bottom-2 flex gap-2 z-50",
          position === "right" ? "right-2" : "left-2"
        )}
      >
        {isVisible && (
          <button
            onClick={() => setOverDesign(!overDesign)}
            className="bg-white text-black px-2 py-1 rounded-md border border-black cursor-pointer"
          >
            {overDesign ? "Show Design Below" : "Show Design Above"}
          </button>
        )}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white text-black px-2 py-1 rounded-md border border-black cursor-pointer"
        >
          {isVisible ? "Hide Design" : "Show Design"}
        </button>
        <button
          onClick={() => setPosition(position === "right" ? "left" : "right")}
          className="bg-white text-black px-2 py-1 rounded-md border border-black cursor-pointer"
        >
          {position === "right" ? "Move to Left" : "Move to Right"}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(parseInt(e.target.value))}
          className="w-24"
        />
      </div>
    </>
  );
}
