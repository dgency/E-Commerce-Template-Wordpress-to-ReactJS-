import { MessageCircle } from "lucide-react";
import { themeConfig } from "@/config/theme.config";

const WhatsAppFAB = () => {
  const whatsappUrl = `https://wa.me/${themeConfig.whatsAppNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 sm:bottom-24 md:bottom-24 lg:bottom-8 right-4 md:right-4 lg:right-8 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-scale-in"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppFAB;
