'use client'
import { useState } from 'react'

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Removed arg handling functions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.key) {
        alert('Key is required')
        setIsSubmitting(false)
        return
      }
      
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

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {isOpen ? 'Cancel' : 'Import Tool'}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import MCP Tool</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Tool Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ToolKey"
                    required
                  />
                </div>
                
                {/* Command field removed */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homepage
                  </label>
                  <input
                    type="text"
                    name="homepage"
                    value={formData.homepage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Tool description"
                />
              </div>
              
              {/* Arguments section removed */}
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-75"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Importing...' : 'Import Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}