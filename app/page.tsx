'use client'
import Footer from '@/components/footer'
import HeroText from '@/components/hero-text'
import ImportToolForm from '@/components/import-tool-form'
import SearchInput from '@/components/search-input'
import allServers from '@/public/servers.json'
import {useState, useMemo, useEffect, useCallback} from 'react'
import Link from 'next/link'

const areArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, index) => val === sortedB[index])
}

export default function Home() {
  const [filter, setFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const onSearch = useCallback((newWords: string[]) => {
    if (!areArraysEqual(newWords, filter)) {
      setFilter(newWords)
      setCurrentPage(1)
    }
  }, [filter]) // Depend on filter to capture the latest state


    const highlightText = (text: string) => {
        let result = text
        filter.forEach((word) => {
            const regex = new RegExp(word, 'gi')
            result = result.replace(
                regex,
                (match) => `<span class="highlight">${match}</span>`
            )
        })
        return result
    }

    const filteredServers = useMemo(() => {
        let filtered = allServers
        if (filter.length > 0) {
            filtered = allServers.filter((s: any) => {
                return filter.some((f) => {
                    return (
                        (s.name || s.key)
                            .toLowerCase()
                            .includes(f.toLowerCase()) ||
                        (s.description || '')
                            .toLowerCase()
                            .includes(f.toLowerCase())
                    )
                })
            })
        }
        console.log(`Total servers: ${filtered.length}`)
        return filtered
    }, [filter])

    // Handle page changes
    // Add this useEffect to track page changes
    useEffect(() => {
        console.log('Page changed to:', currentPage);
    }, [currentPage]);

    const goToPage = (page: number) => {
        console.log(`Attempting to go to page ${page}, current page is ${currentPage}`)
        if (page >= 1 && page <= totalPages) {
            console.log(`Setting current page to ${page}`)
            setCurrentPage(page)
            // Scroll to top when changing pages
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // Debug log for current page
    // Calculate pagination
    const totalPages = Math.ceil(filteredServers.length / itemsPerPage)
    const paginatedServers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredServers.slice(startIndex, endIndex)
    }, [filteredServers, currentPage, itemsPerPage])

    return (
        <div className="p-5 mx-auto">
            <header className="mb-10">
                <div className="flex justify-between items-center">
                    <div className='mr-3'>
                        <img src="https://placehold.co/48x48/5D3FD3/ffffff?text=RL" width="48" alt="Renn Labs logo" />
                    </div>
                    <div className="flex gap-2">
                        <SearchInput onSearch={onSearch} />
                        <ImportToolForm />
                    </div>
                </div>
                <div className="text-2xl font-bold">
                    <div className="w-[768px] hidden md:block mt-12">
                        <HeroText />
                    </div>
                    <div className="block md:hidden mt-6">
                        <p className="text-4xl font-bold">
                            Discover Exceptional MCP Servers
                        </p>
                    </div>
                </div>
            </header>

            {/* Server grid layout */}
            <main className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {paginatedServers.map((s) => (
                        <div
                            key={s.key}
                            className="hover:bg-stone-100 p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col h-full"
                        >
                            <div className="text-xl font-medium mb-2">
                                <span className="tint-color">●</span>&nbsp;
                                <Link href={`/server/${s.key}`} className="hover:underline">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: highlightText(s.name || s.key),
                                        }}
                                    />
                                </Link>
                            </div>
                            <div
                                className="flex-grow mb-2 text-sm text-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: highlightText(s.description || ''),
                                }}
                            />
                            {/* Server URL is removed from the home page as requested */}
                        </div>
                    ))}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                            aria-label="Previous page"
                        >
                            &laquo;
                        </button>
                        
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'border border-gray-300'
                                    }`}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                            aria-label="Next page"
                        >
                            &raquo;
                        </button>
                    </div>
                )}
            </main>
            
            <Footer/>
        </div>
    )
}
