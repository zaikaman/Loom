"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";
import TestimonialCard from "./TestimonialCard";
import ArrowLeftIcon from "@/app/assets/icons/testimonials/arrow-left.svg";
import ArrowRightIcon from "@/app/assets/icons/testimonials/arrow-right.svg";
import StarIcon from "@/app/assets/icons/testimonials/star.svg";

type Testimonial = {
  quote: string;
  authorName: string;
  authorTitle: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Loom completely transformed how we communicate with our users. The timeline view is stunning, and our community loves voting on features. It feels like a premium extension of our product.",
    authorName: "Sarah Chen",
    authorTitle: "Founder of StackQueue",
  },
  {
    quote:
      "Finally, a roadmap tool that doesn't look like a spreadsheet. Loom's headless approach let us integrate it perfectly into our existing site. It's beautiful and functional.",
    authorName: "Mark Davis",
    authorTitle: "CTO at DevFlow",
  },
  {
    quote:
      "The threaded updates are a game changer. We can explain 'why' we're building something, not just 'what' and 'when'. Our user engagement has doubled since switching to Loom.",
    authorName: "Jessica Lee",
    authorTitle: "Product Manager at OpenCore",
  },
  {
    quote:
      "As an indie maker, I needed something simple but professional. Loom gave me that 'wow' factor instantly. It's the best way to build in public.",
    authorName: "Alex Rivera",
    authorTitle: "Indie Hacker",
  },
  {
    quote:
      "Loom's design is top-notch. It makes our changelog look like a carefully curated story of our product's evolution. Highly recommend it to any startup.",
    authorName: "Emily Zhang",
    authorTitle: "Design Lead at PixelArt",
  },
];

const fixModulo = (value: number, modulo: number) => {
  return ((value % modulo) + modulo) % modulo;
};

export default function Testimonials({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const actualIndex = fixModulo(currentIndex, testimonials.length);

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const setActualIndex = (index: number) => {
    setCurrentIndex(
      (prev) => prev + (index - fixModulo(prev, testimonials.length))
    );
  };

  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState<{
    x: number;
    x0: number;
    y: number;
    y0: number;
    isHorizontal: boolean | null;
  } | null>(null);
  const pointerRef = useRef(pointer);
  const handlePointerMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const handlePointerUpRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const currentPointer = pointerRef.current;
    if (!currentPointer) return;

    // Determine if this is a horizontal gesture
    const deltaX = Math.abs(e.pageX - currentPointer.x0);
    const deltaY = Math.abs(e.pageY - currentPointer.y0);

    // If we haven't determined direction yet, check now
    if (currentPointer.isHorizontal === null) {
      // Detect horizontal movement earlier (threshold of 3px instead of 5px)
      const isHorizontal = deltaX > deltaY && deltaX > 3;
      if (isHorizontal) {
        // Once we know it's horizontal, prevent default to stop scrolling
        e.preventDefault();
        e.stopPropagation();
        setPointer((prev) => (prev ? { ...prev, isHorizontal: true } : null));
      } else if (deltaY > 8) {
        // If it's clearly vertical, cancel the gesture early
        const moveHandler = handlePointerMoveRef.current;
        const upHandler = handlePointerUpRef.current;
        if (moveHandler) {
          window.removeEventListener("pointermove", moveHandler);
        }
        if (upHandler) {
          window.removeEventListener("pointerup", upHandler);
        }
        setPointer(null);
        return;
      }
    } else if (currentPointer.isHorizontal) {
      // Only prevent default if we've confirmed it's horizontal
      e.preventDefault();
      e.stopPropagation();
    }

    setPointer((prev) => (prev ? { ...prev, x: e.pageX, y: e.pageY } : null));
  }, []);

  const handlePointerUp = useCallback(() => {
    const moveHandler = handlePointerMoveRef.current;
    const upHandler = handlePointerUpRef.current;
    if (moveHandler) {
      window.removeEventListener("pointermove", moveHandler);
    }
    if (upHandler) {
      window.removeEventListener("pointerup", upHandler);
    }
    const pointer = pointerRef.current;
    if (!pointer || pointer.isHorizontal === false) {
      setPointer(null);
      return;
    }
    const cardWidth = cardsRef.current?.clientWidth ?? 0;
    const deltaX = pointer.x - pointer.x0;
    const deltaSign = Math.abs(deltaX) > 10 ? Math.sign(deltaX) : 0;
    if (deltaSign) {
      const deltaIndex = cardWidth
        ? Math.ceil(Math.abs(deltaX) / cardWidth) * deltaSign
        : deltaSign;
      setCurrentIndex((prev) => prev - deltaIndex);
    }
    setPointer(null);
  }, []);

  useEffect(() => {
    handlePointerMoveRef.current = handlePointerMove;
    handlePointerUpRef.current = handlePointerUp;
  }, [handlePointerMove, handlePointerUp]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't prevent default immediately - wait to see direction
      e.stopPropagation();
      const moveHandler = handlePointerMoveRef.current;
      const upHandler = handlePointerUpRef.current;
      if (moveHandler) {
        window.addEventListener("pointermove", moveHandler, { passive: false });
      }
      if (upHandler) {
        window.addEventListener("pointerup", upHandler);
      }
      setPointer(() => ({
        x: e.pageX,
        x0: e.pageX,
        y: e.pageY,
        y0: e.pageY,
        isHorizontal: null,
      }));
    },
    []
  );

  const translateXPercentage =
    (-currentIndex * 100) / testimonials.length + "%";
  const translateXPixels = pointer ? `${pointer.x - pointer.x0}px` : "";
  const translateX = translateXPixels
    ? `calc(${translateXPercentage} + ${translateXPixels})`
    : translateXPercentage;

  return (
    <div
      className={cn(
        "max-w-[1440px] mx-auto px-[100px] max-xl:px-[60px] max-sm:px-[30px]",
        className
      )}
    >
      <div
        className={cn(
          "bg-[#191a23] overflow-clip relative rounded-[45px] size-full",
          className
        )}
        data-name="Testimonials block"
      >
        <div
          className="flex flex-col gap-[120px] max-md:gap-[80px] max-sm:gap-[40px] items-center relative pt-[84px] pb-[64px] max-md:py-[60px] max-sm:py-[40px]"
          data-name="Testimonials"
        >
          <div
            className="flex items-start justify-center gap-0 relative shrink-0 w-full overflow-hidden xl:pr-[14px] max-lg:px-[30px]"
            data-name="Cards"
            onPointerDown={handlePointerDown}
          >
            <div className="w-full max-w-[656px] mx-auto" ref={cardsRef}>
              <div
                className="flex items-start transition-transform duration-300 ease-in-out"
                style={{
                  width: `${testimonials.length * 100}%`,
                  transform: `translateX(${translateX})`,
                  transition: pointer ? "none" : undefined,
                }}
              >
                {testimonials.map((testimonial, index) => {
                  const N = testimonials.length;
                  const offset = Math.round((currentIndex - index) / N) * N;
                  const transform = `translateX(${offset * 100}%)`;
                  return (
                    <TestimonialCard
                      key={index}
                      quote={testimonial.quote}
                      authorName={
                        testimonial.authorName +
                        (process.env.NODE_ENV === "development"
                          ? ` #${index + 1}${" ".repeat(60)}#${index + 1}`
                          : "")
                      }
                      authorTitle={testimonial.authorTitle}
                      style={{ transform }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="content-stretch flex items-center justify-between gap-[10px] relative shrink-0 w-full px-[40px] max-w-[644px] xl:mr-[14px]"
            data-name="Navigation"
          >
            <button
              onClick={handlePrevious}
              className={cn(
                "relative shrink-0 w-[20px] h-[22px] cursor-pointer hover:opacity-30 transition-opacity flex items-center justify-center",
                actualIndex === 0 && "opacity-30"
              )}
              data-name="Arrow left"
              aria-label="Previous testimonial"
            >
              <ArrowLeftIcon
                className="block max-w-none size-full"
                width={23}
                height={22}
              />
            </button>
            <div className="col-1 h-[14px] ml-0 mt-0 relative row-1 w-full max-w-[146px] flex items-center justify-between flex-1">
              {Array.from({ length: testimonials.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActualIndex(index)}
                  className="p-0 m-0 border-none bg-transparent cursor-pointer"
                  aria-label={
                    index === actualIndex
                      ? `Current testimonial ${index + 1} of ${testimonials.length
                      }`
                      : `Go to testimonial ${index + 1} of ${testimonials.length
                      }`
                  }
                >
                  <StarIcon
                    className={cn(
                      "block max-w-none size-full",
                      index === actualIndex ? "text-[#B9FF66]" : "text-white"
                    )}
                    width={14}
                    height={14}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className={cn(
                "relative shrink-0 w-[20px] h-[22px] cursor-pointer hover:opacity-30 transition-opacity flex items-center justify-center",
                actualIndex === testimonials.length - 1 && "opacity-30"
              )}
              data-name="Arrow right"
              aria-label="Next testimonial"
            >
              <ArrowRightIcon
                className="block max-w-none size-full"
                width={23}
                height={22}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
