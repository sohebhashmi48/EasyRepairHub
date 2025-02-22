import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Laptop, 
  Tv, 
  Speaker, 
  Tablet,
  Watch 
} from "lucide-react";
import { Link } from "wouter";

const categories = [
  {
    name: "Smartphones",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1603694681044-e71c5993d6cd",
    slug: "smartphones"
  },
  {
    name: "Laptops",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea",
    slug: "laptops"
  },
  {
    name: "TVs",
    icon: Tv,
    image: "https://images.unsplash.com/photo-1609230430613-13cf4862a80f",
    slug: "tvs"
  },
  {
    name: "Audio",
    icon: Speaker,
    image: "https://images.unsplash.com/photo-1603732551658-5fabbafa84eb",
    slug: "audio"
  },
  {
    name: "Tablets",
    icon: Tablet,
    image: "https://images.unsplash.com/photo-1671418285905-acc08f6c4b59",
    slug: "tablets"
  },
  {
    name: "Smartwatches",
    icon: Watch,
    image: "https://images.unsplash.com/photo-1603694681044-e71c5993d6cd",
    slug: "smartwatches"
  }
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link key={category.slug} href={`/category/${category.slug}`}>
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div 
                className="aspect-square rounded-lg mb-4 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="w-full h-full bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <category.icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-center">{category.name}</h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}