'use client'
import { useState } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input, TextArea, TextField } from '@/components/ui/textfield'

interface ToolFormData {
  name: string
  key: string
  description: string
  homepage: string
  env?: Record<string, string>
}

export default function ImportToolForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    key: '',
    description: '',
    homepage: '',
  })
  const [keyError, setKeyError] = useState<string | null>(null)

  const updateFormData = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when key is filled
    if (name === 'key' && value && keyError) {
      setKeyError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.key) {
      setKeyError('Key is required')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log('Submitting tool:', formData)
      
      // Call the API to add the tool
      const response = await fetch('/api/import-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([formData]), // API expects an array of tools
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`${data.message}\nReloading page to show updated tools...`)
        // Reset form and close it
        setFormData({
          name: '',
          key: '',
          description: '',
          homepage: '',
        })
        setIsOpen(false)
        // Reload the page to show the updated tools
        window.location.reload()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error submitting tool:', error)
      alert('Failed to import tool. See console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log('Rendering ImportToolForm with UI components');
  
  return (
    <div>
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
                
                <TextField className="group flex flex-col gap-2" isInvalid={!!keyError} isRequired>
                  <Label>Key</Label>
                  <Input
                    value={formData.key}
                    onChange={(e) => updateFormData('key', e.target.value)}
                  />
                  {keyError && <FieldError>{keyError}</FieldError>}
                </TextField>
                
                <TextField className="group flex flex-col gap-2">
                  <Label>Homepage</Label>
                  <Input
                    value={formData.homepage}
                    onChange={(e) => updateFormData('homepage', e.target.value)}
                  />
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