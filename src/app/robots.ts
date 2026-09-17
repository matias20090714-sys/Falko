import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://falko.dpdns.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/marketplace",
          "/product/*",
          "/migrate",
          "/seller/academy",
          "/terms",
          "/privacy",
          "/refund-policy",
          "/affiliate-terms",
        ],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/admin/*",
          "/seller/*",
          "/affiliate/*",
          "/wallet/*",
          "/withdrawals/*",
          "/library/*",
          "/checkout/*",
          "/profile/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
