import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/cart";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Fetch the specific product by slug and also fetch all products to find related items
  const { data: productResult, isLoading: productsLoading } = useWooCommerceProducts({ slug });
  const { data: allProducts } = useWooCommerceProducts();
  const { data: categories } = useWooCommerceCategories();

  const product = productResult?.[0];
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Image gallery state
  const images: string[] = useMemo(() => {
    if (!product) return [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) return product.images as string[];
    return product.image ? [product.image] : [];
  }, [product]);
  const [selectedImage, setSelectedImage] = useState<string | null>(images[0] || null);
  // embla api to sync thumbnails with main carousel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Variations (optional) - basic support if product.variations exists
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  // variations may come from API; silence explicit-any lint for this optional developer-provided structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variations = product && (product as any).variations && Array.isArray((product as any).variations) ? (product as any).variations : [];
  const selectedVariation = variations.length > 0 ? variations[selectedVariationIndex] : null;

  useEffect(() => {
    setSelectedImage(images[0] || null);
    setSelectedVariationIndex(0);
    setSelectedIndex(0);
  }, [slug, images]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelectedIndex(idx);
      setSelectedImage(images[idx] || images[0] || null);
    };

    emblaApi.on('select', onSelect);
    // initialize
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, images]);

  const shortDescription = useMemo(() => {
    if (!product?.description) return '';
    const words = product.description.split(/\s+/);
    if (words.length <= 60) return product.description;
    return words.slice(0, 60).join(' ') + '...';
  }, [product]);

  // Derive a brand on the client as a fallback if API didn't include it yet
  const derivedBrand = useMemo(() => {
    if (!product) return undefined;
    // Primary: API-provided brand
    const fromApi = (product as unknown as { brand?: string }).brand;
    if (typeof fromApi === 'string' && fromApi.trim()) return fromApi.trim();

    // Secondary: from simplified attributes (if exposed by API)
    const attrs = (product as unknown as { attributes?: { name?: string; options?: string[] }[] }).attributes;
    if (Array.isArray(attrs)) {
      const brandAttr = attrs.find((a) => (a.name ?? '').toLowerCase() === 'brand');
      const opt = brandAttr?.options?.[0];
      if (opt && typeof opt === 'string' && opt.trim()) return opt.trim();
      // try any attribute whose name contains 'brand'
      const fuzzy = attrs.find((a) => /brand/i.test(a.name ?? ''));
      const opt2 = fuzzy?.options?.[0];
      if (opt2 && typeof opt2 === 'string' && opt2.trim()) return opt2.trim();
    }

    // Secondary: sometimes theme/plugin injects brand into description or fullDescription
    const tryParse = (value?: string) => {
      if (!value) return undefined;
      // Attempt to find patterns like "Brand: ACME" (HTML or plain text)
      const htmlMatch = value.match(/>\s*Brand\s*:?\s*([^<]+)</i);
      if (htmlMatch?.[1]) return htmlMatch[1].trim();
      const textOnly = value.replace(/<[^>]*>/g, ' ');
  const textMatch = textOnly.match(/\bBrand\s*:?\s*([\p{L}\d &_\-/]*)/iu);
      if (textMatch?.[1]) return textMatch[1].trim();
      return undefined;
    };

  const fd = (product as unknown as { fullDescription?: string }).fullDescription;
  return tryParse(fd) || tryParse(product.description);
  }, [product]);

  if (productsLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = categories?.find((c) => c.slug === product?.category);
  const relatedProducts = allProducts
    ? allProducts.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4)
    : [];

  const handleAddToCart = () => {
    if (!product) return;

    const idSource = selectedVariation ? selectedVariation.id : product.id;
    const cleanId = idSource.toString().replace(/^p/, '');
    if (isNaN(parseInt(cleanId, 10))) {
      toast.error('Invalid product. Please refresh the page.');
      return;
    }

    const price = selectedVariation ? selectedVariation.price ?? product.price : product.price;
    const image = selectedVariation ? selectedVariation.image ?? selectedImage ?? product.image : selectedImage ?? product.image;

    addToCart(
      {
        id: cleanId,
        name: product.name + (selectedVariation ? ` - ${selectedVariation.name || ''}` : ''),
        price,
        image,
        slug: product.slug,
      },
      quantity
    );
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // go to checkout
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/category/${category.slug}`} className="hover:text-foreground transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left: Modern Main Image + Thumbnails */}
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center mb-6">
              <div className="bg-white rounded-xl p-6 flex items-center justify-center relative" style={{ minHeight: 320, minWidth: 320 }}>
                {/* Modern pill badges top left */}
                <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                  {product.discount && product.discount > 0 && (
                    <span className="inline-block bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">-{product.discount}%</span>
                  )}
                  {product.inStock ? (
                    <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">In Stock</span>
                  ) : (
                    <span className="inline-block bg-gray-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Out of Stock</span>
                  )}
                </div>
                <img src={selectedImage || images[0]} alt={product.name} className="max-h-[320px] max-w-full object-contain" />
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 mt-2">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => { setSelectedImage(img); setSelectedIndex(idx); }}
                    className={`bg-white border rounded-lg p-1 flex items-center justify-center transition-all duration-150 hover:border-primary focus:border-primary ${selectedIndex === idx ? 'border-primary ring-2 ring-primary' : 'border-muted'}`}
                    style={{ width: 64, height: 64 }}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{product.name}</h1>
            {/* Modern pill line for Category, SKU, Brand */}
            <div className="flex flex-wrap gap-2 mb-4">
              {category?.name && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{category.name}</span>
              )}
              {product.id && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">SKU: {selectedVariation ? (selectedVariation.sku ?? selectedVariation.id) : product.id}</span>
              )}
              {derivedBrand && (
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">Brand: {derivedBrand}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span>{product.rating ? `${product.rating} / 5` : ''}</span>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-extrabold">{formatCurrency(selectedVariation ? (selectedVariation.price ?? product.price) : product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>
              {/* short description (max ~60 words) */}
              {shortDescription && (
                <p className="text-muted-foreground mt-4">{shortDescription}</p>
              )}
            </div>
            {/* Variations selector if present */}
            {variations.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium block mb-2">Options</label>
                <div className="flex gap-2 flex-wrap">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {variations.map((v: any, idx: number) => (
                    <button key={v.id || idx} onClick={() => setSelectedVariationIndex(idx)} className={`px-3 py-2 rounded-md border ${selectedVariationIndex === idx ? 'bg-primary text-white' : 'bg-white'}`}>
                      {v.name || v.attribute || `Variant ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity + Actions */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted transition-colors rounded-l-full"><Minus className="h-4 w-4" /></button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors rounded-r-full"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 flex gap-3">
                <Button onClick={handleAddToCart} disabled={!product.inStock} className="btn-gradient rounded-full w-full max-w-[180px]"> <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart</Button>
                <Button onClick={handleBuyNow} variant="outline" className="rounded-full w-full max-w-[180px]">Buy Now</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description (single tab-style) */}
        <section className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <div className="prose max-w-none text-muted-foreground">
            {product.description}
          </div>
        </section>
        {/* Related Products */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Related Products</h2>
          {relatedProducts && relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">No related products found.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
