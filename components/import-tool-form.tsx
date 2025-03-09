'use client'
import { useState } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldError, Label } from '@/components/ui/field'
import { Input, TextArea, TextField } from '@/components/ui/textfield'
import { useToast } from '@/components/ui/toast'

interface ToolFormData {
  name: string
  description: string
  homepage: string
  env?: Record<string, string>
}

export default function ImportToolForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    description: '',
    homepage: '',
  })
  const [homepageError, setHomepageError] = useState<string | null>(null)
  const { showToast, ToastContainer } = useToast()

  const updateFormData = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when homepage is filled
    if (name === 'homepage' && value && homepageError) {
      setHomepageError(null)
    }
  }

  // Function to generate a key from homepage URL
  const generateKeyFromHomepage = (homepage: string): string | null => {
    try {
      const url = new URL(homepage)
      const pathParts = url.pathname.split('/').filter(Boolean)
      
      if (url.hostname === 'github.com' && pathParts.length >= 2) {
        // For GitHub URLs: username/repo or username/repo/subfolder
        return pathParts.length > 2
          ? `${pathParts[1]}-${pathParts.slice(2).join('-')}` // Include subfolder
          : pathParts[1] // Just repo name
      } else {
        // For other URLs, use hostname + first path part if available
        return pathParts.length > 0
          ? `${url.hostname}-${pathParts[0]}`
          : url.hostname
      }
    } catch (error) {
      console.log('Error parsing URL:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Log the form data to see what we have available
    console.log('Form data before submission:', formData)
    
    // Validate required fields - homepage is now required to generate the key
    if (!formData.homepage) {
      setHomepageError('Homepage URL is required to generate a key')
      return
    }
    
    // Generate key from homepage
    const generatedKey = generateKeyFromHomepage(formData.homepage)
    if (!generatedKey) {
      setHomepageError('Could not generate a key from the provided URL')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create the complete tool data with the generated key
      const completeToolData = {
        ...formData,
        key: generatedKey
      }
      
      console.log('Submitting tool with auto-generated key:', completeToolData)
      
      // Call the API to add the tool
      const response = await fetch('/api/import-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([completeToolData]), // API expects an array of tools
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Show success toast
        showToast(`${data.message}`, 'success')
        
        // Reset form and close it
        setFormData({
          name: '',
          description: '',
          homepage: '',
        })
        setIsOpen(false)
        
        // Store current page in localStorage before reloading
        const currentPage = new URLSearchParams(window.location.search).get('page') || '1';
        localStorage.setItem('mcpsvr_current_page', currentPage);
        
        // Reload the page to show the updated tools after a short delay
        // to allow the user to see the toast notification
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        // Show error toast
        showToast(`Error: ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Error submitting tool:', error)
      showToast('Failed to import tool. See console for details.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log('Rendering ImportToolForm with UI components');
  
  return (
    <div>
      {/* Toast container for notifications */}
      <ToastContainer />
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
      >
        {isOpen ? 'Cancel' : 'Import Tool'}
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto text-card-foreground">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import MCP Tool</h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TextField className="group flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </TextField>
                
                <TextField className="group flex flex-col gap-2" isInvalid={!!homepageError} isRequired>
                  <Label>Homepage URL</Label>
                  <Input
                    value={formData.homepage}
                    onChange={(e) => updateFormData('homepage', e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                  {homepageError && <FieldError>{homepageError}</FieldError>}
                  <div className="text-xs text-muted-foreground">
                    The key will be auto-generated from this URL
                  </div>
                </TextField>
              </div>
              
              <div className="mb-4">
                <TextField className="group flex flex-col gap-2">
                  <Label>Description</Label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </TextField>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Importing...' : 'Import Tool'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}