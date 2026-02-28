import { constructMetadata } from "@/lib/utils/seo";
import { MarketClient } from "./_components/market-client";

export const metadata = constructMetadata({
  title: "Market",
  description: "Mahsulotlarni boshqarish va do'kon sozlamalari.",
});

export default function MarketPage() {
  return <MarketClient />;
}
