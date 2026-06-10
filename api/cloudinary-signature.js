import { v2 as cloudinary } from 'cloudinary'

const folder = 'trade-journal-screenshots'

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return response.status(500).json({
      error: 'Cloudinary server credentials are not configured.',
    })
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret)

  return response.status(200).json({
    apiKey,
    cloudName,
    folder,
    timestamp,
    signature,
  })
}
