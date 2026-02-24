import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brush, CreditCard, Globe, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import artPieceService from "@/services/artPiece.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LandingPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (p: number | undefined | null) =>
    typeof p === 'number' && !isNaN(p)
      ? p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : '';

const getProducts = async () => {
  try {
    const response = await artPieceService.getAllSellables(404, 404);

    console.log(response, "Full response");

    if (response.artPieces && Array.isArray(response.artPieces.artPieces)) {
      setData(response.artPieces.artPieces);
    } else if (response.artPieces && Array.isArray(response.artPieces)) {
      setData(response.artPieces);
    } else {
      setData([]); 
      console.warn("Unexpected data format for artPieces");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load products");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F2EA] text-[#8A5A3B]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#F9F2EA]/90 z-10"></div>
        </div>

        <div className="container relative z-20 mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-6">
              Discover & Collect <span className="font-medium">Exceptional Art</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#A67C52] max-w-2xl mx-auto">
              A curated marketplace connecting artists with art lovers. Showcase your creativity or find your next
              masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"/gallery"} className="bg-[#C8977F] hover:bg-[#B78370] text-white border-none rounded-none px-5 py-3">
                Browse Gallery
              </Link>
              <Link href={`/addProduct`}
                className="border border-[#C8977F] text-[#C8977F] hover:bg-[#C8977F]/10 rounded-none px-5 py-3"
              >
                Sell Your Art
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F9F2EA] to-transparent"></div>
      </section>

      {/* Featured Artworks */}
<section className="py-8 md:py-12">
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-end mb-6">
      <h2 className="text-2xl md:text-3xl font-light tracking-wider">
        Featured <span className="font-medium">Artworks</span>
      </h2>
      <Link href="/gallery" className="flex items-center text-[#C8977F] hover:text-[#B78370] transition-colors">
        View all <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {isLoading ? (
        <p>Loading.......</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        Array.isArray(data) && 
        [...data] // Create a copy of the array
          .sort(() => 0.5 - Math.random()) // Randomize order
          .slice(0, 4) // Take only 4 items
          .map((item) => (
            <div
              key={item.id}
              className="bg-[#EFE5DD] overflow-hidden group transition-all duration-300"
            >
              <div className="relative aspect-[1/1] overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="p-3 space-y-1">
                <div className="flex justify-between items-start">
                  <h2 className="font-light text-sm tracking-wide line-clamp-1">{item.title}</h2>
                  <div className="text-[#9D7A64] font-light text-xs">
                    {Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                </div>
                
                <p className="text-xs text-[#9D7A64] truncate">
                  {item.artist}
                </p>
                
                <div className="pt-2">
                  <Link
                    href={`/product/${item.id}`}
                    className="text-xs block border border-[#B69985] text-[#8A5A3B] py-1 px-2 text-center hover:bg-[#B69985] hover:text-[#F4EFE7] transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  </div>
</section>

      {/* Artist Spotlight */}
      <section className="py-16 md:py-24 bg-[#EFE6DC]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-wider text-center mb-12">
            Artist <span className="font-medium">Spotlight</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative aspect-square">
              <img
                src="https://cloudnativeproject.blob.core.windows.net/image/african-art.jpg"
                alt="Featured Artist"
                className="object-cover"
              />
            </div>
            <div className="max-w-xl">
              <h3 className="text-xl md:text-2xl font-medium mb-2">Amara Nwosu</h3>
              <p className="text-[#A67C52] mb-6">Contemporary African Art</p>
              <p className="mb-6 text-lg">
                "My work explores the intersection of traditional African aesthetics and contemporary global influences.
                Each piece tells a story of cultural heritage and modern identity."
              </p>
              <p className="mb-8">
                Amara's distinctive style has earned recognition in galleries across three continents. Her pieces
                combine vibrant colors with powerful symbolism, creating works that are both visually striking and
                deeply meaningful.
              </p>
              {/* <Button className="bg-[#C8977F] hover:bg-[#B78370] text-white border-none rounded-none">
                <Link href={'/gallery'}>
                  View Collection
                </Link>
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-wider text-center mb-4">
            Why Choose <span className="font-medium">NIMAH</span>
          </h2>
          <p className="text-center text-[#A67C52] max-w-2xl mx-auto mb-16">
            Our platform is designed to support artists and delight collectors with a seamless experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-none shadow-sm rounded-none">
              <CardContent className="pt-8">
                <div className="bg-[#C8977F]/10 p-3 rounded-full w-fit mb-6">
                  <Brush className="h-6 w-6 text-[#C8977F]" />
                </div>
                <h3 className="text-xl font-medium mb-2">For Artists</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Global exposure to art collectors and enthusiasts</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Simple upload process and inventory management</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Secure payments with competitive commission rates</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Professional artist profile and portfolio</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm rounded-none">
              <CardContent className="pt-8">
                <div className="bg-[#C8977F]/10 p-3 rounded-full w-fit mb-6">
                  <ShoppingBag className="h-6 w-6 text-[#C8977F]" />
                </div>
                <h3 className="text-xl font-medium mb-2">For Collectors</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Discover unique artworks from around the world</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Direct connection with artists</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Secure transactions and buyer protection</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-[#C8977F]" />
                    <span>Curated collections and personalized recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-[#EFE6DC]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-[#C8977F]" />
              </div>
              <div className="text-4xl font-light mb-2">2,500+</div>
              <div className="text-[#A67C52]">Active Artists</div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Brush className="h-8 w-8 text-[#C8977F]" />
              </div>
              <div className="text-4xl font-light mb-2">10,000+</div>
              <div className="text-[#A67C52]">Artworks</div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <CreditCard className="h-8 w-8 text-[#C8977F]" />
              </div>
              <div className="text-4xl font-light mb-2">15,000+</div>
              <div className="text-[#A67C52]">Happy Collectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-wider mb-4">
              Ready to <span className="font-medium">Join Us?</span>
            </h2>
            <p className="text-lg mb-8 text-[#A67C52]">
              Whether you're an artist looking to showcase your work or a collector searching for your next masterpiece,
              NIMAH Art Boutique is the perfect platform for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#C8977F] hover:bg-[#B78370] text-white border-none rounded-none px-8 py-6">
                <Link href={"/login"}>
                  Create Account
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-[#C8977F] text-[#C8977F] hover:bg-[#C8977F]/10 rounded-none px-8 py-6"
              >
                <Link href={"/about"}>
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#EFE6DC] py-12 border-t border-[#E8D7C9]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-medium tracking-wider">NIMAH</h3>
                <p className="text-xs tracking-widest">ART BOUTIQUE</p>
              </div>
              <p className="text-sm text-[#A67C52] mb-4">Connecting artists and art lovers around the world.</p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Browse Art
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Featured Artists
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Virtual Exhibitions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">For Artists</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Sell Your Art
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Artist Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Pricing & Fees
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#C8977F]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E8D7C9] mt-8 pt-8 text-sm text-[#A67C52] text-center">
            © {new Date().getFullYear()} NIMAH Art Boutique. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
