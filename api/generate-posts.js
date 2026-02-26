import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { property, platform } = req.body

    if (!property || !platform) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const propertyContext = `
Property Name: ${property.name}
Location: ${property.location}
Price: ₦${property.price?.toLocaleString()}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Description: ${property.description}
Tone: ${property.tone || 'Luxury/Sophisticated'}
Brand Hashtags: ${property.brandKit?.hashtags?.join(', ') || 'N/A'}
Brand Phone: ${property.brandKit?.phone || 'N/A'}
Images: ${property.images?.map((img) => `${img.name}: ${img.description}`).join(', ')}
    `.trim()

    let systemPrompt = ''
    let userPrompt = ''

    if (platform === 'facebook') {
      systemPrompt = `You are a professional real estate marketing expert. Generate an engaging, long-form Facebook post (200-300 words) that sells this property. Include:
- Compelling headline
- Key features and benefits
- Call-to-action
- Relevant hashtags
- Mention which images would work best
- Make sure to match the tone of the property (e.g. luxury, family-friendly, modern)`
      userPrompt = `Generate a Facebook post for this property:\n\n${propertyContext}`
    }

    if (platform === 'twitter') {
      systemPrompt = `You are a professional real estate marketing expert. Generate a concise, engaging Twitter/X post (approximately 190 characters). Include:
- Hook
- Key selling point
- Call-to-action
- 2-3 hashtags
- Recommend best image
- Ensure the tone matches the property's vibe (e.g. luxury, cozy, modern)`
      userPrompt = `Generate a Twitter/X post for this property:\n\n${propertyContext}`
    }

    if (platform === 'instagram') {
      systemPrompt = `You are a professional real estate marketing expert. Generate an Instagram caption (100-150 words). Include:
- Engaging opening
- Key features
- Lifestyle appeal
- Call-to-action
- 5-10 hashtags
- Best image recommendation
- Suggested vibe/music
- Match the tone of the property (e.g. luxury, family-friendly, modern)`
      userPrompt = `Generate an Instagram post for this property:\n\n${propertyContext}`
    }

    // ✅ Correct Cohere usage (same pattern as your working version)
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: userPrompt,
      preamble: systemPrompt,
      maxTokens: 500,
    })

    const content = response?.text

    if (!content) {
      throw new Error('Cohere returned empty response')
    }

    return res.status(200).json({
      success: true,
      platform,
      content: content.trim(),
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate post',
      details: error.message,
    })
  }
}