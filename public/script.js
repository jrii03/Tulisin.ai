// AutoCaption AI - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('captionForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const captionResult = document.getElementById('captionResult');
    const errorMessage = document.getElementById('errorMessage');

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = {
                productName: formData.get('productName').trim(),
                languageStyle: formData.get('languageStyle'),
                targetAudience: formData.get('targetAudience').trim()
            };

            // Validate required fields
            if (!data.productName || !data.languageStyle) {
                showError('Mohon isi semua field yang wajib diisi (Nama Produk dan Gaya Bahasa)');
                return;
            }

            // Show loading state
            setLoadingState(true);
            hideError();
            hideResult();

            try {
                // Call API endpoint
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success && result.caption) {
                    showResult(result.caption);
                } else {
                    throw new Error(result.error || 'Gagal menghasilkan caption');
                }

            } catch (error) {
                console.error('Error:', error);
                
                // Handle different types of errors
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showError('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil dan coba lagi.');
                } else if (error.message.includes('404')) {
                    showError('Endpoint API tidak ditemukan. Pastikan server backend sudah berjalan.');
                } else if (error.message.includes('500')) {
                    showError('Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.');
                } else {
                    showError(error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
                }
            } finally {
                setLoadingState(false);
            }
        });
    }
});

// Set loading state
function setLoadingState(isLoading) {
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');

    if (isLoading) {
        generateBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
    } else {
        generateBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Show result
function showResult(caption) {
    const resultSection = document.getElementById('resultSection');
    const captionResult = document.getElementById('captionResult');
    
    captionResult.textContent = caption;
    resultSection.classList.remove('hidden');
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide result
function hideResult() {
    const resultSection = document.getElementById('resultSection');
    resultSection.classList.add('hidden');
}

// Show error
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    
    // Scroll to error
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide error
function hideError() {
    const errorSection = document.getElementById('errorSection');
    errorSection.classList.add('hidden');
}

// Copy to clipboard
function copyToClipboard() {
    const captionResult = document.getElementById('captionResult');
    const copyBtn = document.getElementById('copyBtn');
    
    // Create a temporary textarea to copy text
    const textarea = document.createElement('textarea');
    textarea.value = captionResult.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        
        // Show success feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Tersalin!';
        copyBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        copyBtn.classList.add('bg-green-500');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('bg-green-500');
            copyBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showError('Gagal menyalin teks. Silakan salin secara manual.');
    }
    
    document.body.removeChild(textarea);
}

// Reset form
function resetForm() {
    const form = document.getElementById('captionForm');
    form.reset();
    hideResult();
    hideError();
    
    // Scroll to top of form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Demo mode - for testing without backend
function enableDemoMode() {
    console.log('Demo mode enabled - using mock responses');
    
    // Override the form submission for demo
    const form = document.getElementById('captionForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const productName = formData.get('productName').trim();
            const languageStyle = formData.get('languageStyle');
            const targetAudience = formData.get('targetAudience').trim();

            if (!productName || !languageStyle) {
                showError('Mohon isi semua field yang wajib diisi (Nama Produk dan Gaya Bahasa)');
                return;
            }

            setLoadingState(true);
            hideError();
            hideResult();

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate mock caption based on style
            const mockCaptions = {
                formal: `🏢 ${productName}

Produk berkualitas tinggi yang dirancang khusus untuk memenuhi kebutuhan ${targetAudience || 'pelanggan'} yang mengutamakan kualitas dan kepraktisan.

✅ Kualitas terjamin
✅ Harga kompetitif  
✅ Pelayanan profesional

Hubungi kami untuk informasi lebih lanjut dan pemesanan.

#${productName.replace(/\s+/g, '')} #KualitasTerjamin #ProdukBerkualitas`,

                lucu: `😄 Halo-halo! Ada yang baru nih! 

${productName} yang kece badai! 🔥

Cocok banget buat ${targetAudience || 'kamu'} yang pengen tampil beda dan keren! 

🎉 Dijamin bikin happy
🎉 Harga ramah di kantong
🎉 Kualitas oke punya!

Buruan order sebelum kehabisan! Jangan sampai nyesel ya! 😉

#${productName.replace(/\s+/g, '')} #KeceBadai #JanganSampaiNyesel`,

                singkat: `${productName} ⭐

${targetAudience ? `Untuk ${targetAudience}` : 'Produk pilihan'}
✓ Berkualitas
✓ Terjangkau  
✓ Terpercaya

Order sekarang!

#${productName.replace(/\s+/g, '')}`,

                promosi: `🔥 PROMO SPESIAL! 🔥

${productName} 
${targetAudience ? `Khusus untuk ${targetAudience}!` : 'Penawaran terbatas!'}

💥 DISKON BESAR-BESARAN!
💥 GRATIS ONGKIR!
💥 GARANSI UANG KEMBALI!

Jangan sampai terlewat! Stock terbatas!

⏰ Promo berakhir dalam 24 jam!
📱 Order via DM atau WhatsApp

#${productName.replace(/\s+/g, '')} #PromoSpesial #DiskonBesar #StockTerbatas`
            };

           const caption = mockCaptions[languageStyle] || mockCaptions.formal;
            
            setLoadingState(false);
            showResult(caption);
        });
    }
}

// Uncomment the line below to enable demo mode for testing
// enableDemoMode();
