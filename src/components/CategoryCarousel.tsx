import { Link } from "react-router-dom";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const CategoryCarousel = () => {
  const { data: categories, isLoading } = useWooCommerceCategories();
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const shouldAutoPlay = (categories?.length || 0) >= 5;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-2">
            Popular Departments
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">Products From These Categories Often Buy</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={shouldAutoPlay ? [plugin.current] : []}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {categories?.map((category) => (
                <CarouselItem key={category.id} className="pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Link
                    to={`/category/${category.slug}`}
                    className="block group relative overflow-hidden rounded-xl"
                  >
                    <div className="relative aspect-[16/9]">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                        <h3 className="text-xl font-semibold font-heading group-hover:text-primary-foreground transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-white/80 mt-1">
                          {category.count} Products
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="flex left-2 md:-left-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-7 w-7 md:h-8 md:w-8" />
            <CarouselNext className="flex right-2 md:-right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-7 w-7 md:h-8 md:w-8" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default CategoryCarousel;
