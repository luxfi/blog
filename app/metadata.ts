import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadataKeywords = [
    "Blog",
    "Lux Network",
    "Lux Blog",
    "Blockchain",
    "Consensus",
    "Post-Quantum Cryptography",
    "Multi-Consensus Architecture",
    "Wave Protocol",
    "EVM Compatibility",
    "Sovereign Compute",
    "Decentralized Infrastructure",
    "Validator Network",
    "ZK Proofs",
    "Bridge Protocol",
]

export const metadata: Metadata = {
    title: siteConfig.name,
    description: siteConfig.description,
    keywords: metadataKeywords,
    authors: [
        {
            name: "Lux Network",
            url: "https://lux.network",
        },
    ],
    creator: "Lux Network",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        creator: "@luxnetwork",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};
