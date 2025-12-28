import { cn } from "@/app/lib/utils";
import ServiceCard, {
  type CardVariant,
  type IllustrationStyle,
} from "./ServiceCard";
import type { StaticImageData } from "next/image";
import imgSEO from "@/app/assets/illustrations/services/tokyo-magnifier-web-search-with-elements-2.png";
import imgPPC from "@/app/assets/illustrations/services/tokyo-selecting-a-value-in-the-browser-window-1.png";
import imgSocialMedia from "@/app/assets/illustrations/services/tokyo-browser-window-with-emoticon-likes-and-stars-around-2.png";
import imgEmail from "@/app/assets/illustrations/services/tokyo-sending-messages-from-one-place-to-another-1.png";
import imgContent from "@/app/assets/illustrations/services/tokyo-many-browser-windows-with-different-information-1.png";
import imgAnalytics from "@/app/assets/illustrations/services/tokyo-volumetric-analytics-of-different-types-in-web-browsers-2.png";

type ServiceItem = {
  lines: string[];
  cardVariant: CardVariant;
  illustrationSrc: StaticImageData;
  illustrationAlt: string;
  illustrationStyle: IllustrationStyle;
};

const services: ServiceItem[] = [
  {
    lines: ["Interactive", "Timelines"],
    cardVariant: "Grey",
    illustrationSrc: imgSEO,
    illustrationAlt: "Interactive Timelines illustration",
    illustrationStyle: {
      containerHeight: 170,
      backgroundSize: { width: 148.84, height: 183.86 },
    },
  },
  {
    lines: ["Headless &", "Flexible"],
    cardVariant: "Green",
    illustrationSrc: imgPPC,
    illustrationAlt: "Headless & Flexible illustration",
    illustrationStyle: {
      containerHeight: 147.624,
      backgroundSize: { width: 126.73, height: 180.28 },
    },
  },
  {
    lines: ["Community", "Engagement"],
    cardVariant: "DarkWhite",
    illustrationSrc: imgSocialMedia,
    illustrationAlt: "Community Engagement illustration",
    illustrationStyle: {
      containerHeight: 210,
      backgroundSize: { width: 141.44, height: 141.44 },
    },
  },
  {
    lines: ["Follows &", "Notifications"],
    cardVariant: "Grey",
    illustrationSrc: imgEmail,
    illustrationAlt: "Follows & Notifications illustration",
    illustrationStyle: {
      containerHeight: 192.68,
      backgroundSize: { width: 140.67, height: 153.3 },
      backgroundPosition: { x: 59 - 75.7, y: 50 - 76.6 },
      transform: "scaleX(-1)",
    },
  },
  {
    lines: ["Threaded", "Progress"],
    cardVariant: "Green",
    illustrationSrc: imgContent,
    illustrationAlt: "Threaded Progress illustration",
    illustrationStyle: {
      containerHeight: 195.915,
      backgroundSize: { width: 132.08, height: 141.26 },
    },
  },
  {
    lines: ["Premium", "Design"],
    cardVariant: "DarkGreen",
    illustrationSrc: imgAnalytics,
    illustrationAlt: "Premium Design illustration",
    illustrationStyle: {
      containerHeight: 170,
      backgroundSize: { width: 108.36, height: 134.02 },
    },
  },
];

export default function Services({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-[40px] max-xl:gap-[30px] max-lg:grid-cols-1 items-start relative w-full max-w-[1440px] mx-auto px-[100px] max-xl:px-[60px] max-sm:px-[30px] scroll-mt-[40px]",
        className
      )}
      id="services"
    >
      {services.map((service, index) => (
        <ServiceCard key={index} {...service} />
      ))}
    </div>
  );
}
