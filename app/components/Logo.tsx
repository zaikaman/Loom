import LogoIcon from "@/app/assets/icons/logo-icon.svg";

import { cn } from "../lib/utils";

export default function Logo({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-label="Loom Logo"
      {...props}
      className={cn("flex items-center gap-2", className)}
    >
      <LogoIcon
        className="block shrink-0 fill-current"
        width={30}
        height={30}
      />
      <span className="text-[30px] font-medium leading-none">Loom</span>
    </div>
  );
}
