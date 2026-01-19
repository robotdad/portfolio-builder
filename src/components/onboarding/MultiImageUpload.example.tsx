/**
 * Example usage of MultiImageUpload component
 * 
 * This demonstrates how to integrate the component into a form,
 * particularly for the onboarding flow's first-project page.
 */

'use client'

import { useState } from 'react'
import { MultiImageUpload } from './MultiImageUpload'

export function MultiImageUploadExample() {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleImagesChange = (newImages: File[], newPreviews: string[]) => {
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Example: Upload images to server
    if (images.length > 0) {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append(`image-${index}`, image)
      })
      
      // Send to API endpoint
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      
      console.log(`Submitting ${images.length} images`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <MultiImageUpload
        images={images}
        previews={previews}
        onImagesChange={handleImagesChange}
        maxFiles={10}
        maxSizeMB={10}
        disabled={false}
      />
      
      <button type="submit" style={{ marginTop: '20px' }}>
        Submit ({images.length} photos)
      </button>
    </form>
  )
}

/**
 * Integration into onboarding state
 * 
 * For the first-project page, you would integrate like this:
 */

// In your page component:
// const [projectImages, setProjectImages] = useState<File[]>([])
// const [projectImagePreviews, setProjectImagePreviews] = useState<string[]>([])

// Then in your form:
// <MultiImageUpload
//   images={projectImages}
//   previews={projectImagePreviews}
//   onImagesChange={(images, previews) => {
//     setProjectImages(images)
//     setProjectImagePreviews(previews)
//     // Optionally sync to onboarding state
//     updateState({ projectImages: images, projectImagePreviews: previews })
//   }}
// />
