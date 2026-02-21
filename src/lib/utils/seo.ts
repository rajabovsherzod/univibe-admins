import { type Metadata } from "next";

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = "Boshqaruv Paneli",
  description = "Professional University Management System",
  image = "/og", // Defaults to dynamic route unless specified
  icons = "/icon.svg", // Re-map back to proper icon
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image.startsWith("/og")
            ? `${image}?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
              description
            )}`
            : image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        image.startsWith("/og")
          ? `${image}?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
            description
          )}`
          : image,
      ],
    },
    icons,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "")}`
        : "http://localhost:3000"
    ),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
