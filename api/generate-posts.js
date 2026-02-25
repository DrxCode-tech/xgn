import { CohereClientV2 } from 'cohere-ai'

const cohere = new CohereClientV2({
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

    // Prepare property context
    const propertyContext = `
Property Name: ${property.name}
Location: ${property.location}
Price: ₦${property.price?.toLocaleString()}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Description: ${property.description}
Images: ${property.images?.map((img) => `${img.name}: ${img.description}`).join(', ')}
    `.trim()

    let prompt = ''
    let systemPrompt = ''

    if (platform === 'facebook') {
      systemPrompt = `You are a professional real estate marketing expert. Generate an engaging, long-form Facebook post (200-300 words) that sells this property. Include:
- Compelling headline
- Key features and benefits
- Call-to-action
- Relevant hashtags
- Mention which images would work best for this post`

      prompt = `Generate a Facebook post for this property:\n\n${propertyContext}`
    } else if (platform === 'twitter') {
      systemPrompt = `You are a professional real estate marketing expert. Generate a concise, engaging Twitter/X post (approximately 190 characters) that sells this property. Include:
- Hook/attention grabber
- Key selling point
- Call-to-action
- Relevant hashtags (2-3)
- Mention which image would work best`

      prompt = `Generate a Twitter/X post for this property:\n\n${propertyContext}`
    } else if (platform === 'instagram') {
      systemPrompt = `You are a professional real estate marketing expert. Generate an Instagram caption (100-150 words) that sells this property. Include:
- Engaging opening line
- Key features
- Lifestyle appeal
- Call-to-action
- Relevant hashtags (5-10)
- Recommend the best image for this post
- Suggest a music/vibe that matches the property`

      prompt = `Generate an Instagram post for this property:\n\n${propertyContext}`
    }

    const response = await cohere.chat({
      model: 'command-r-plus',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: systemPrompt,
      maxTokens: 500,
    })

    const content = response.message.content[0].text

    return res.status(200).json({
      success: true,
      platform,
      content,
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
