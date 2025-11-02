import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import categories from "@/data/categories.json";

const HeaderSecondary = () => {
  const [isOpen, setIsOpen] = useState(false);

  const CategoryLinks = ({ mobile = false }) => (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-6"}>
      <Link
        to="/shop"
        className="text-sm font-medium hover:text-accent transition-colors"
        onClick={() => mobile && setIsOpen(false)}
      >
        All Products
      </Link>
      {categories.slice(0, 8).map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="text-sm font-medium hover:text-accent transition-colors whitespace-nowrap"
          onClick={() => mobile && setIsOpen(false)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="border-b border-gray-200 bg-white hidden lg:block lg:sticky lg:top-16 lg:z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu (still available via Sheet) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background">
              <nav className="mt-8">
                <CategoryLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block w-full">
            <CategoryLinks />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HeaderSecondary;
