'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export default function ServerContent({ server }: { server: any }) {
    const [readme, setReadme] = useState<string>('')
    const [markdownError, setMarkdownError] = useState<string | null>(null)

    useEffect(() => {
        if (server?.homepage) {
            console.log('Processing homepage URL:', server.homepage);
            
            // Check if the URL already points to a README file
            if (server.homepage.toLowerCase().includes('readme.md')) {
                console.log('URL already points to a README file');
                // Convert GitHub web URL to raw content URL if needed
                let readmeUrl = server.homepage;
                if (readmeUrl.includes('github.com') && !readmeUrl.includes('raw.githubusercontent.com')) {
                    readmeUrl = readmeUrl.replace('github.com', 'raw.githubusercontent.com')
                                         .replace('/blob/', '/');
                }
                
                console.log('Fetching from direct README URL:', readmeUrl);
                fetch(readmeUrl)
                    .then(res => {
                        console.log('README direct fetch status:', res.status);
                        return res.text();
                    })
                    .then(text => {
                        console.log('Fetched README content (direct):', text.substring(0, 200) + '...');
                        setReadme(text);
                    })
                    .catch(err => {
                        console.error('Failed to fetch direct README:', err);
                        setMarkdownError('Failed to fetch README content');
                    });
            } else if (server.homepage.includes('github.com') && server.homepage.includes('/tree/')) {
                // Handle GitHub subdirectory URLs (e.g., /tree/main/src/puppeteer)
                console.log('Detected GitHub subdirectory URL');
                
                // Transform /tree/ URL to /blob/ URL with README.md appended
                const readmeUrl = server.homepage
                    .replace('/tree/', '/blob/') // Change from tree to blob
                    .replace(/\/$/, '') + '/README.md'; // Append README.md, handling trailing slash
                
                const rawUrl = readmeUrl
                    .replace('github.com', 'raw.githubusercontent.com')
                    .replace('/blob/', '/');
                
                console.log('Constructed README URL for subdirectory:', readmeUrl);
                console.log('Raw URL for fetching:', rawUrl);
                
                fetch(rawUrl)
                    .then(res => {
                        console.log('Subdirectory README fetch status:', res.status);
                        if (!res.ok) throw new Error(`Failed to fetch subdirectory README (status: ${res.status})`);
                        return res.text();
                    })
                    .then(text => {
                        console.log('Fetched README content from subdirectory:', text.substring(0, 200) + '...');
                        setReadme(text);
                    })
                    .catch(err => {
                        console.error('Failed to fetch subdirectory README:', err);
                        setMarkdownError('Failed to fetch README content from subdirectory');
                    });
            } else {
                // Extract owner and repo from GitHub URL
                const match = server.homepage.match(/github\.com\/([^/]+)\/([^/]+)/)
                if (match) {
                    const [, owner, repo] = match;
                    console.log(`Extracted owner: ${owner}, repo: ${repo}`);
                    
                    // Construct URL with README.md appended
                    const baseUrl = server.homepage.endsWith('/')
                        ? server.homepage
                        : `${server.homepage}/`;
                    
                    // Try to fetch README from the URL + README.md
                    const readmeUrl = `${baseUrl}README.md`;
                    const rawMainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
                    const rawMasterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
                    
                    console.log('Trying to fetch README from:', readmeUrl);
                    
                    // First try with appended README.md
                    fetch(readmeUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/'))
                        .then(res => {
                            console.log('README append fetch status:', res.status);
                            if (!res.ok) throw new Error('Failed to fetch appended README');
                            return res.text();
                        })
                        .then(text => {
                            console.log('Fetched README content (appended):', text.substring(0, 200) + '...');
                            setReadme(text);
                        })
                        .catch(() => {
                            // Fall back to main branch
                            console.log('Falling back to main branch README:', rawMainUrl);
                            fetch(rawMainUrl)
                                .then(res => {
                                    console.log('README main branch fetch status:', res.status);
                                    if (!res.ok) throw new Error('Failed to fetch main branch README');
                                    return res.text();
                                })
                                .then(text => {
                                    console.log('Fetched README content (main branch):', text.substring(0, 200) + '...');
                                    setReadme(text);
                                })
                                .catch(() => {
                                    // Try master branch as last resort
                                    console.log('Falling back to master branch README:', rawMasterUrl);
                                    fetch(rawMasterUrl)
                                        .then(res => {
                                            console.log('README master branch fetch status:', res.status);
                                            if (!res.ok) throw new Error('Failed to fetch master branch README');
                                            return res.text();
                                        })
                                        .then(text => {
                                            console.log('Fetched README content (master branch):', text.substring(0, 200) + '...');
                                            setReadme(text);
                                        })
                                        .catch(err => {
                                            console.error('All README fetch attempts failed:', err);
                                            setMarkdownError('Failed to fetch README content after multiple attempts');
                                        });
                                });
                        });
                } else {
                    console.log('Not a GitHub URL or format not recognized');
                    // For non-GitHub URLs, try appending README.md directly
                    const baseUrl = server.homepage.endsWith('/')
                        ? server.homepage
                        : `${server.homepage}/`;
                    const readmeUrl = `${baseUrl}README.md`;
                    
                    console.log('Trying to fetch README from non-GitHub URL:', readmeUrl);
                    fetch(readmeUrl)
                        .then(res => {
                            console.log('Non-GitHub README fetch status:', res.status);
                            if (!res.ok) throw new Error('Failed to fetch README');
                            return res.text();
                        })
                        .then(text => {
                            console.log('Fetched README from non-GitHub URL:', text.substring(0, 200) + '...');
                            setReadme(text);
                        })
                        .catch(err => {
                            console.error('Failed to fetch README from non-GitHub URL:', err);
                            setMarkdownError('Failed to fetch README content');
                        });
                }
            }
        }
    }, [server])

    return (
        <main>
            {/* {server.description && (
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
            )} */}

            {markdownError && (
                <div className="text-red-500 mb-6">{markdownError}</div>
            )}

            {readme && (
                <div className="prose prose-stone max-w-none">
                    <ReactMarkdown
                        // Enable rehype-raw to parse and render HTML within markdown
                        // Use rehype-sanitize to prevent XSS attacks
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                        {readme}
                    </ReactMarkdown>
                </div>
            )}
        </main>
    )
} 