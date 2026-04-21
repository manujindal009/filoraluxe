import { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "Toys & Amigurumi",
    slug: "toys-amigurumi",
    description: "Handcrafted crochet plushies, dolls, and figurines.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/toys%20and%20amigurumi.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Accessories",
    slug: "accessories",
    description: "Wearable crochet pieces for every season.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/accsessory.jpeg",
    subcategories: [
      {
        id: "c1000000-0000-0000-0000-000000000101",
        categoryId: "c1000000-0000-0000-0000-000000000002",
        name: "Clips",
        slug: "clips",
        description: "Beautifiul handmade crochet hair clips."
      },
      {
        id: "c1000000-0000-0000-0000-000000000102",
        categoryId: "c1000000-0000-0000-0000-000000000002",
        name: "Hairbands",
        slug: "hairbands",
        description: "Elegant and comfortable crochet hairbands."
      }
    ]
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Bags & Storage",
    slug: "bags-storage",
    description: "Stunning handmade bags, totes, and pouches.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/bags.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    name: "Home & Living",
    slug: "home-living",
    description: "Crochet décor to elevate your living spaces.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/home%20nd%20living.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    name: "Gifts & Decor",
    slug: "gifts-decor",
    description: "Thoughtful handcrafted gifts and decorative items.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/gifts%20and%20decor.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",
    name: "Utility Products",
    slug: "utility-products",
    description: "Practical everyday crochet essentials.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/Utility%20products.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000007",
    name: "Custom & Personalized",
    slug: "custom-personalized",
    description: "Made-to-order pieces tailored just for you.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/custom%20and%20personalised.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000008",
    name: "Seasonal Collection",
    slug: "seasonal-collection",
    description: "Limited edition festive and seasonal drops.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/seasonal.png"
  },
  {
    id: "c1000000-0000-0000-0000-000000000009",
    name: "Art & Premium",
    slug: "art-premium",
    description: "Museum-quality crochet art and collector pieces.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/art.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000010",
    name: "DIY & Supplies",
    slug: "diy-supplies",
    description: "Everything you need to start your crochet journey.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/diy.jpeg"
  },
  {
    id: "c1000000-0000-0000-0000-000000000011",
    name: "Spiritual",
    slug: "spiritual",
    description: "Handcrafted items for spiritual wellness and decor.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/spiritual;.png",
    subcategories: [
      {
        id: "c1000000-0000-0000-0000-000000001101",
        categoryId: "c1000000-0000-0000-0000-000000000011",
        name: "Laddu Gopal Dresses",
        slug: "laddu-gopal-dresses",
        description: "Handmade crochet dresses for Laddu Gopal."
      }
    ]
  },
  {
    id: "c1000000-0000-0000-0000-000000000012",
    name: "Wearables",
    slug: "wearables",
    description: "Stay cozy and stylish with our crochet wearables.",
    image: "https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/categories/seasonal%20collection.jpeg",
    subcategories: [
      {
        id: "c1000000-0000-0000-0000-000000001201",
        categoryId: "c1000000-0000-0000-0000-000000000012",
        name: "Socks",
        slug: "socks",
        description: "Warm and comfortable crochet socks."
      },
      {
        id: "c1000000-0000-0000-0000-000000001202",
        categoryId: "c1000000-0000-0000-0000-000000000012",
        name: "Mufflers",
        slug: "mufflers",
        description: "Elegant and cozy crochet mufflers."
      }
    ]
  }
];
