'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function ServerContent({ server }: { server: any }) {
    const [readme, setReadme] = useState<string>('')

    useEffect(() => {
        if (server?.homepage) {
            // Extract owner and repo from GitHub URL
            const match = server.homepage.match(/github\.com\/([^/]+)\/([^/]+)/)
            if (match) {
                const [, owner, repo] = match
                // Fetch README content
                fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`)
                    .then(res => res.text())
                    .then(text => setReadme(text))
                    .catch(() => {
                        // Try README.md in different casing or try master branch
                        fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`)
                            .then(res => res.text())
                            .then(text => setReadme(text))
                            .catch(err => console.error('Failed to fetch README:', err))
                    })
            }
        }
    }, [server])

    return (
        <main>
            {server.description && (
                <p className="text-lg mb-6">{server.description}</p>
            )}
            
            {server.homepage && (
                <div className="mb-6">
                    <a
                        href={server.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                    >
                        GitHub Repository →
                    </a>
                </div>
            )}

            {readme && (
                <div className="prose prose-stone max-w-none">
                    <ReactMarkdown>{readme}</ReactMarkdown>
                </div>
            )}
        </main>
    )
} 