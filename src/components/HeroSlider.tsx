import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { themeConfig } from "@/config/theme.config";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";

const slides = [
  {
    image: heroSlide1,
    title: "Autumn Sale Is Here!",
    subtitle: "Extra 10% off on all orders",
    cta: "Shop Now",
    link: "/shop",
  },
  {
    image: heroSlide2,
    title: "Latest Electronics",
    subtitle: "Cutting-edge tech at unbeatable prices",
    cta: "Explore Tech",
    link: "/category/electronics",
  },
  {
    image: heroSlide3,
    title: "Fashion Forward",
    subtitle: "Trendy styles for every occasion",
    cta: "View Collection",
    link: "/category/fashion",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, themeConfig.hero.autoplaySpeed);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] md:h-[640px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white animate-slide-up">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-3 md:mb-4 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
                  {slide.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">{slide.subtitle}</p>
                <Link to={slide.link}>
                  <Button size="lg" className="btn-gradient text-sm sm:text-base md:text-lg px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {themeConfig.hero.showArrows && (
        <>
          {/* On mobile/tablet, keep arrows away from the text block by moving them near the bottom.
              On md+ screens, place them vertically centered as usual. */}
          <button
            onClick={goToPrevious}
            className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 border border-white/25 backdrop-blur-sm text-white p-3 rounded-full shadow-md transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 border border-white/25 backdrop-blur-sm text-white p-3 rounded-full shadow-md transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {themeConfig.hero.showDots && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
