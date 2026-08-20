document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const filter = document.getElementById('filter');
    const detail = document.getElementById('detail');
    const detailBody = document.getElementById('detail-body');
    const closeDetail = document.getElementById('close-detail');

    // Fullscreen lightbox elements
    const fullscreenViewer = document.getElementById('fullscreen-viewer');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const fullscreenCaption = document.getElementById('fullscreen-caption');
    const fullscreenClose = document.getElementById('fullscreen-close');
    const fullscreenPrev = document.getElementById('fullscreen-prev');
    const fullscreenNext = document.getElementById('fullscreen-next');

    let models = [];
    let currentModelImages = [];
    let currentImageIndex = 0;

    fetch('/api/models')
        .then(response => response.json())
        .then(data => {
            models = data;
            renderGallery(models);
        });

    function renderGallery(modelsToRender) {
        gallery.innerHTML = '';
        modelsToRender.forEach(model => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.dataset.modelPath = model.path;
            thumb.innerHTML = `
                <div class="thumbnail-img-container">
                    <img src="${model.thumb}" alt="${model.name}" loading="lazy">
                </div>
                <p>${model.name}</p>
            `;
            thumb.addEventListener('click', () => showDetail(model));
            gallery.appendChild(thumb);
        });
    }

    filter.addEventListener('input', () => {
        const filterValue = filter.value.toLowerCase();
        const filteredModels = models.filter(model => model.name.toLowerCase().includes(filterValue));
        renderGallery(filteredModels);
    });

    function showDetail(model) {
        const encodedModelPath = encodeURIComponent(model.path);
        fetch(`/api/model/${encodedModelPath}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Model details not found.');
                }
                return response.json();
            })
            .then(data => {
                // Sanitize and linkify readme content
                const sanitizedText = (data.readme || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const linkedText = sanitizedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

                // Create file download links
                let filesHtml = `
                    <div class="download-section">
                        <h3>Download Dateien:</h3>
                        <ul class="download-list">
                `;
                if (data.files && data.files.length > 0) {
                    data.files.forEach(file => {
                        const downloadPath = `${model.path}/${file}`;
                        filesHtml += `<li><a href="/api/download/${downloadPath}" download>📦 ${file}</a></li>`;
                    });
                } else {
                    filesHtml += '<li>Keine Modelldateien gefunden.</li>';
                }
                filesHtml += '</ul></div>';

                // Save images list for fullscreen lightbox
                currentModelImages = data.images || [];

                // Create thumbnails section at bottom of detail view
                let thumbsHtml = '';
                if (currentModelImages.length > 0) {
                    thumbsHtml = `
                        <div class="detail-thumbs-section">
                            <h3>Bilder (${currentModelImages.length})</h3>
                            <div class="detail-thumbs-grid">
                    `;
                    currentModelImages.forEach((img, index) => {
                        thumbsHtml += `
                            <div class="detail-thumb-item" data-index="${index}">
                                <img src="${img.thumbUrl}" alt="${img.name}">
                            </div>
                        `;
                    });
                    thumbsHtml += `</div></div>`;
                }

                detailBody.innerHTML = `
                    <h2>${model.name}</h2>
                    ${linkedText ? `<pre>${linkedText}</pre>` : ''}
                    ${filesHtml}
                    ${thumbsHtml}
                `;

                // Add click listeners to detail thumbnails
                const thumbItems = detailBody.querySelectorAll('.detail-thumb-item');
                thumbItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const idx = parseInt(item.getAttribute('data-index'), 10);
                        openFullscreen(idx);
                    });
                });

                detail.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching model details:', error);
                detailBody.innerHTML = `<h2>Fehler</h2><p>${error.message}</p>`;
                detail.style.display = 'block';
            });
    }

    closeDetail.addEventListener('click', () => {
        detail.style.display = 'none';
    });

    // Close detail view when clicking backdrop
    detail.addEventListener('click', (e) => {
        if (e.target === detail) {
            detail.style.display = 'none';
        }
    });

    // --- Fullscreen Lightbox Logic ---
    function openFullscreen(index) {
        if (!currentModelImages || currentModelImages.length === 0) return;
        currentImageIndex = index;
        updateFullscreenImage();
        fullscreenViewer.style.display = 'flex';

        // Show/hide prev/next buttons based on image count
        if (currentModelImages.length > 1) {
            fullscreenPrev.style.display = 'flex';
            fullscreenNext.style.display = 'flex';
        } else {
            fullscreenPrev.style.display = 'none';
            fullscreenNext.style.display = 'none';
        }
    }

    function updateFullscreenImage() {
        const img = currentModelImages[currentImageIndex];
        if (!img) return;
        fullscreenImage.src = img.fullUrl;
        fullscreenCaption.textContent = `${currentImageIndex + 1} / ${currentModelImages.length} — ${img.name}`;
    }

    function closeFullscreen() {
        fullscreenViewer.style.display = 'none';
        fullscreenImage.src = '';
    }

    function nextFullscreen() {
        if (currentModelImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % currentModelImages.length;
        updateFullscreenImage();
    }

    function prevFullscreen() {
        if (currentModelImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + currentModelImages.length) % currentModelImages.length;
        updateFullscreenImage();
    }

    fullscreenClose.addEventListener('click', closeFullscreen);
    fullscreenNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextFullscreen();
    });
    fullscreenPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevFullscreen();
    });

    fullscreenViewer.addEventListener('click', (e) => {
        if (e.target === fullscreenViewer || e.target === fullscreenImage) {
            closeFullscreen();
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (fullscreenViewer.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowRight') {
                nextFullscreen();
            } else if (e.key === 'ArrowLeft') {
                prevFullscreen();
            }
        } else if (detail.style.display === 'block') {
            if (e.key === 'Escape') {
                detail.style.display = 'none';
            }
        }
    });
});
