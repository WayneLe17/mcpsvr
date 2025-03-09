import type {Metadata} from 'next'
import '@fontsource-variable/bricolage-grotesque'
import './globals.css'

export const metadata: Metadata = {
    title: 'Discover Exceptional MCP Servers',
    keywords: 'Open Source, LLM, MCP Servers, Model Context Protocol, MCP, Renn Labs',
    description:
        'This is a hub for users to discover top MCP servers, unlocking advanced AI capabilities and accelerating innovation.',
    openGraph: {
        title: 'Discover Exceptional MCP Servers',
        description:
            'This is a hub for users to discover top MCP servers, unlocking advanced AI capabilities and accelerating innovation.',
        url: `https://rennlabs.com`,
        siteName: 'Renn Labs',
        // images: [
        //     {
        //         url: 'https://rennlabs.com/open-graph.jpg',
        //         width: 1200,
        //         height: 630,
        //         alt: 'rennlabs.com',
        //     },
        // ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Renn Labs - Discover Exceptional MCP Servers',
        description:
            'This is a hub for users to discover top MCP servers, unlocking advanced AI capabilities and accelerating innovation.',
        creator: '@rennlabs',
        images: [
            {
                url: 'https://rennlabs.com/open-graph.jpg',
                width: 1200,
                height: 630,
                alt: 'rennlabs.com',
            },
        ],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="h-full">
            <body className="antialiased flex justify-center">{children}</body>
        </html>
    )
}
