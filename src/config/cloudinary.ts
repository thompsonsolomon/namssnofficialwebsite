// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET',
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', cloudinaryConfig.uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export async function uploadToUploadcare(file: File): Promise<string> {
  const publicKey = "11885640b3e12b251886"

  if (!file) throw new Error("No file provided")

  const url = "https://upload.uploadcare.com/base/"

  const formData = new FormData()
  formData.append("UPLOADCARE_PUB_KEY", publicKey)
  formData.append("UPLOADCARE_STORE", "1")
  formData.append("file", file)

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Upload failed: ${text}`)
    }

    const data = await response.json()

    if (!data.file) {
      throw new Error("No file UUID returned from Uploadcare")
    }

    return `https://ucarecdn.com/${data.file}/`
  } catch (error) {
    console.error("Uploadcare upload error:", error)
    throw error
  }
}
