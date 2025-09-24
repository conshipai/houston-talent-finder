'use client'
import React, { useState, useCallback } from 'react'
import { Upload, X, Image, CheckCircle, AlertCircle } from 'lucide-react'
// Add these type definitions
type UploadProgress = {
  [key: string]: {
    name: string
    progress: number
  }
}

type UploadedImage = {
  id: string
  url: string
  thumbnailUrl: string
  name: string
  size: number
}
export default function ImageUploadComponent() {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState({})

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const validateFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `${file.name}: File must be JPEG, PNG, or WebP` }
    }
    
    if (file.size > MAX_SIZE) {
      return { valid: false, error: `${file.name}: File size must be less than 10MB` }
    }
    
    return { valid: true }
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    setError('')
    
    // Validate all files first
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
    }
    
    // Upload files
    for (const file of fileArray) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file) => {
    const fileId = Date.now() + Math.random()
    
    try {
      setUploading(true)
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { name: file.name, progress: 0 }
      }))
      
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)
      formData.append('isPublic', 'true')
      
      // Simulate progress (in real app, use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: Math.min((prev[fileId]?.progress || 0) + 20, 90)
          }
        }))
      }, 200)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      
      if (response.ok) {
        const data = await response.json()
        
        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file)
        
        setUploadedImages(prev => [...prev, {
          id: data.media.id,
          url: previewUrl,
          thumbnailUrl: data.media.thumbnailUrl,
          name: file.name,
          size: file.size,
        }])
        
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 100 }
        }))
        
        // Remove progress indicator after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Failed to upload ${file.name}`)
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    else return Math.round(bytes / 1048576) + ' MB'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Your Photos</h2>
        
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">
            {dragActive ? 'Drop your images here' : 'Drag & drop your photos here'}
          </p>
          <p className="text-gray-400 text-sm mb-4">or click to browse</p>
          <p className="text-gray-500 text-xs">
            Supported formats: JPEG, PNG, WebP • Max size: 10MB per file
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
  <div className="mt-6 space-y-3">
    <h3 className="text-white font-medium">Uploading...</h3>
    {Object.entries(uploadProgress).map(([id, file]: [string, {name: string, progress: number}]) => (
      <div key={id} className="bg-gray-700 rounded-lg p-3">
        <div className="flex justify-between mb-2">
          <span className="text-white text-sm">{file.name}</span>
          <span className="text-gray-400 text-sm">{file.progress}%</span>
        </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-white font-medium mb-4">Uploaded Photos ({uploadedImages.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(index)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-xs text-gray-400 truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-500 bg-gray-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-medium mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• High-quality, well-lit photos perform better</li>
            <li>• Include a variety of shots (headshots, full body, etc.)</li>
            <li>• Photos will be reviewed before being visible to producers</li>
            <li>• You retain all rights to your images</li>
            <li>• Explicit content is allowed but must be marked appropriately</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
