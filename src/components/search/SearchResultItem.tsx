import React from "react";
import { Badge } from "@/components/ui/badge";

export type SearchResultItemProps = {
  active?: boolean;
  title: string;
  subtitle?: string;
  price?: string | number;
  thumbnail?: string | null;
  onClick?: () => void;
  onMouseEnter?: () => void;
  rightSlot?: React.ReactNode;
};

const placeholderSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='6' fill='%23f1f5f9'/%3E%3Cpath d='M12 26l5-6 4 5 3-4 4 5' stroke='%2394a3b8' stroke-width='2' fill='none'/%3E%3Ccircle cx='15' cy='15' r='3' fill='%2394a3b8'/%3E%3C/svg%3E";

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  active,
  title,
  subtitle,
  price,
  thumbnail,
  onClick,
  onMouseEnter,
  rightSlot,
}) => {
  const [imgSrc, setImgSrc] = React.useState(thumbnail || placeholderSvg);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-none"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={imgSrc || placeholderSvg}
        onError={() => setImgSrc(placeholderSvg)}
        alt="thumbnail"
        className="h-10 w-10 rounded object-cover bg-muted flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            <Badge className="px-1.5 py-0.5" variant="secondary">
              {subtitle}
            </Badge>
          </div>
        )}
      </div>
      <div className="ml-3 text-sm font-semibold text-primary whitespace-nowrap">
        {rightSlot ??
          (price != null
            ? typeof price === "number"
              ? `${price}৳`
              : price
            : null)}
      </div>
    </div>
  );
};

export default SearchResultItem;
