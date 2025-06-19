// AutoCaption AI - Serverless Function for Caption Generation
// This function handles POST requests to generate product captions using OpenRouter API

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Only POST requests are accepted.'
        });
    }

    try {
        // Validate request body
        const { productName, languageStyle, targetAudience } = req.body;

        // Check required fields
        if (!productName || !languageStyle) {
            return res.status(400).json({
                success: false,
                error: 'Field productName dan languageStyle wajib diisi.'
            });
        }

        // Validate language style
        const validStyles = ['formal', 'lucu', 'singkat', 'promosi'];
        if (!validStyles.includes(languageStyle)) {
            return res.status(400).json({
                success: false,
                error: 'Gaya bahasa tidak valid. Pilih: formal, lucu, singkat, atau promosi.'
            });
        }

        // Check API key
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OPENROUTER_API_KEY not found in environment variables');
            return res.status(500).json({
                success: false,
                error: 'Konfigurasi server tidak lengkap. Silakan hubungi administrator.'
            });
        }

        // Build prompt based on language style
        const stylePrompts = {
            formal: `Buatkan caption produk yang formal dan profesional untuk "${productName}". 
                    ${targetAudience ? `Target audiens: ${targetAudience}.` : ''} 
                    Gunakan bahasa yang sopan, informatif, dan meyakinkan. Sertakan emoji yang sesuai dan hashtag yang relevan.`,
            
            lucu: `Buatkan caption produk yang lucu dan menghibur untuk "${productName}". 
                  ${targetAudience ? `Target audiens: ${targetAudience}.` : ''} 
                  Gunakan bahasa yang santai, humor yang ringan, dan emoji yang menarik. Buat caption yang viral dan engaging.`,
            
            singkat: `Buatkan caption produk yang singkat dan padat untuk "${productName}". 
                     ${targetAudience ? `Target audiens: ${targetAudience}.` : ''} 
                     Maksimal 3-4 baris, to the point, dengan poin-poin utama dan hashtag yang efektif.`,
            
            promosi: `Buatkan caption produk yang persuasif dan menarik untuk promosi "${productName}". 
                     ${targetAudience ? `Target audiens: ${targetAudience}.` : ''} 
                     Gunakan kata-kata yang memotivasi pembelian, urgency, dan benefit yang jelas. Sertakan call-to-action yang kuat.`
        };

        const systemPrompt = `Kamu adalah AI copywriter expert yang ahli membuat caption produk untuk media sosial dan marketplace. 
                             Tugas kamu adalah membuat caption yang menarik, engaging, dan efektif untuk meningkatkan penjualan.
                             
                             Aturan:
                             - Gunakan bahasa Indonesia yang natural dan sesuai target audiens
                             - Sertakan emoji yang relevan dan menarik
                             - Tambahkan hashtag yang tepat dan populer
                             - Buat caption yang mudah dibaca dan eye-catching
                             - Fokus pada benefit dan value proposition produk
                             - Panjang caption ideal 50-150 kata
                             
                             Berikan hanya caption saja tanpa penjelasan tambahan.`;

        const userPrompt = stylePrompts[languageStyle];

        // Prepare request to OpenRouter API
        const openRouterRequest = {
            model: "mistralai/mistral-7b-instruct:free",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.8,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.2,
            presence_penalty: 0.1
        };

        // Call OpenRouter API
        console.log('Calling OpenRouter API...');
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://tulisin-ai.vercel.app/', // Optional: your site URL
                'X-Title': 'AutoCaption AI' // Optional: your app name
            },
            body: JSON.stringify(openRouterRequest)
        });

        // Check if API call was successful
        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.text();
            console.error('OpenRouter API Error:', openRouterResponse.status, errorData);
            
            if (openRouterResponse.status === 401) {
                return res.status(500).json({
                    success: false,
                    error: 'API key tidak valid. Silakan hubungi administrator.'
                });
            } else if (openRouterResponse.status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.'
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: 'Gagal terhubung ke layanan AI. Silakan coba lagi.'
                });
            }
        }

        // Parse response
        const responseData = await openRouterResponse.json();
        
        // Extract caption from response
        if (responseData.choices && responseData.choices.length > 0) {
            const caption = responseData.choices[0].message.content.trim();
            
            if (!caption) {
                return res.status(500).json({
                    success: false,
                    error: 'AI tidak menghasilkan caption. Silakan coba lagi.'
                });
            }

            // Log successful generation (without sensitive data)
            console.log('Caption generated successfully for product:', productName);

            // Return success response
            return res.status(200).json({
                success: true,
                caption: caption
            });

        } else {
            console.error('Invalid response structure from OpenRouter:', responseData);
            return res.status(500).json({
                success: false,
                error: 'Format response dari AI tidak valid. Silakan coba lagi.'
            });
        }

    } catch (error) {
        console.error('Error in generate function:', error);
        
        // Handle different types of errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return res.status(500).json({
                success: false,
                error: 'Tidak dapat terhubung ke layanan AI. Periksa koneksi internet.'
            });
        } else if (error instanceof SyntaxError) {
            return res.status(400).json({
                success: false,
                error: 'Format data tidak valid. Periksa input Anda.'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan internal server. Silakan coba lagi.'
            });
        }
    }
}

// Helper function to validate input (optional, for additional validation)
function validateInput(productName, languageStyle, targetAudience) {
    const errors = [];

    // Validate product name
    if (!productName || typeof productName !== 'string') {
        errors.push('Nama produk harus berupa teks yang valid');
    } else if (productName.length < 2) {
        errors.push('Nama produk minimal 2 karakter');
    } else if (productName.length > 100) {
        errors.push('Nama produk maksimal 100 karakter');
    }

    // Validate language style
    const validStyles = ['formal', 'lucu', 'singkat', 'promosi'];
    if (!languageStyle || !validStyles.includes(languageStyle)) {
        errors.push('Gaya bahasa tidak valid');
    }

    // Validate target audience (optional field)
    if (targetAudience && typeof targetAudience === 'string' && targetAudience.length > 200) {
        errors.push('Target audiens maksimal 200 karakter');
    }

    return errors;
}
