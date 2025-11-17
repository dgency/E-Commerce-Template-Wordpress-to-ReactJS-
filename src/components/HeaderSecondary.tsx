import WPMenu from "@/components/navigation/WPMenu";

const HeaderSecondary = () => {

  return (
    <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm hidden lg:block sticky top-[var(--primary-header-height,80px)] z-40 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2.5 lg:py-3">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation powered by WordPress */}
          <nav className="flex w-full overflow-x-auto scrollbar-hide">
            <WPMenu />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HeaderSecondary;
