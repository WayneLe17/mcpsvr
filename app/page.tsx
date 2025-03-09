'use client'
import Footer from '@/components/footer'
import HeroText from '@/components/hero-text'
import ImportToolForm from '@/components/import-tool-form'
import SearchInput from '@/components/search-input'
import {useState, useMemo, useEffect, useCallback} from 'react'
import Link from 'next/link'
import { getAllServers, initializeServersCollection, deleteServerByKey } from '@/lib/serverUtils'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

// Configure dynamic rendering for this route
export const dynamic = 'force-dynamic'

const areArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, index) => val === sortedB[index])
}

export default function Home() {
  const [filter, setFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const itemsPerPage = 8
  const { showToast, ToastContainer } = useToast()
  const { showConfirmDialog, ConfirmDialogContainer } = useConfirmDialog()
  
  // Initialize page from URL or localStorage when component mounts
  useEffect(() => {
    // First check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        console.log('Setting page from URL parameter:', pageNumber);
        setCurrentPage(pageNumber);
      }
    } else {
      // If not in URL, check localStorage
      const storedPage = localStorage.getItem('mcpsvr_current_page');
      if (storedPage) {
        const pageNumber = parseInt(storedPage, 10);
        if (!isNaN(pageNumber) && pageNumber > 0) {
          console.log('Setting page from localStorage:', pageNumber);
          setCurrentPage(pageNumber);
          // Clear localStorage after using it
          localStorage.removeItem('mcpsvr_current_page');
        }
      }
    }
  }, []);

  // Fetch servers from MongoDB when the component mounts
  useEffect(() => {
    async function fetchServers() {
      try {
        console.log('Fetching servers, current page:', currentPage);
        setLoading(true);
        // Initialize the servers collection if it's empty
        await initializeServersCollection();
        // Get all servers from MongoDB
        const data = await getAllServers();
        setServers(data);
        console.log('Servers fetched, current page still:', currentPage);
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchServers();
  }, [currentPage]);

  // Handle server deletion
  const handleDelete = async (key: string) => {
    // Show the confirmation dialog
    showConfirmDialog(
      'Delete Server',
      `Are you sure you want to delete the server with key "${key}"?`,
      async () => {
        // This function runs when the user confirms
        try {
          setDeleting(key);
          const result = await deleteServerByKey(key);
          
          if (result.success) {
            // Remove the server from the state
            setServers(prevServers => prevServers.filter(s => s.key !== key));
            showToast(`Server "${key}" deleted successfully.`, 'success');
          } else {
            showToast('Failed to delete server.', 'error');
          }
        } catch (error) {
          console.error('Error deleting server:', error);
          showToast('An error occurred while deleting the server.', 'error');
        } finally {
          setDeleting(null);
        }
      },
      {
        confirmText: 'Delete Server',
        cancelText: 'Cancel'
      }
    );
  };

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
        let filtered = servers
        if (filter.length > 0) {
            filtered = servers.filter((s) => {
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
    }, [filter, servers])

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
            
            // Update URL with the new page number without full page reload
            const url = new URL(window.location.href);
            url.searchParams.set('page', page.toString());
            window.history.pushState({}, '', url.toString());
            
            // Store current page in localStorage as a backup
            localStorage.setItem('mcpsvr_current_page', page.toString());
            
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
            {/* Toast container for notifications */}
            <ToastContainer />
            
            {/* Confirm dialog container */}
            <ConfirmDialogContainer />
            
            <header className="mb-10">
                <div className="flex justify-between items-center">
                    <div className='mr-3'>
                        <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded">
                            <span className="font-bold">RL</span>
                        </div>
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
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl">Loading servers...</p>
                    </div>
                ) : filteredServers.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl">No servers found. Please add some servers.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                        {paginatedServers.map((s) => (
                        <div
                            key={s.key}
                            className="hover:bg-accent p-4 rounded-lg border border-input bg-card text-card-foreground shadow-sm flex flex-col h-full relative"
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
                                
                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDelete(s.key);
                                    }}
                                    disabled={deleting === s.key}
                                    className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Delete server"
                                    aria-label={`Delete server ${s.name || s.key}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div
                                className="flex-grow mb-2 text-sm text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: highlightText(s.description || ''),
                                }}
                            />
                            {/* Server URL is removed from the home page as requested */}
                        </div>
                    ))}
                    </div>
                )}

                {/* Pagination controls */}
                {!loading && filteredServers.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-input disabled:opacity-50"
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
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-input'
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
                            className="px-3 py-1 rounded border border-input disabled:opacity-50"
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
