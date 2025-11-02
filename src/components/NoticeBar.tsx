import { X } from "lucide-react";
import { useState } from "react";
import { themeConfig } from "@/config/theme.config";

const NoticeBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!themeConfig.noticeEnabled || !isVisible) return null;

  return (
    <div className="bg-accent text-accent-foreground text-sm py-2 px-4 relative">
      <div className="container mx-auto text-center">
        <p className="font-medium">{themeConfig.noticeText}</p>
      </div>
      {themeConfig.noticeDismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          aria-label="Close notice"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default NoticeBar;
