document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const filter = document.getElementById('filter');
    const detail = document.getElementById('detail');
    const detailContent = document.getElementById('detail-content');
    const closeDetail = document.getElementById('close-detail');

    let models = [];

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
                <img src="${model.thumb}" alt="${model.name}">
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
                const sanitizedText = data.readme.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const linkedText = sanitizedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

                // Create file download links
                let filesHtml = '<h3>Download Files:</h3><ul>';
                if (data.files && data.files.length > 0) {
                    data.files.forEach(file => {
                        // The full path for the download link
                        const downloadPath = `${model.path}/${file}`;
                        filesHtml += `<li><a href="/api/download/${downloadPath}" download>${file}</a></li>`;
                    });
                } else {
                    filesHtml += '<li>No model files found.</li>';
                }
                filesHtml += '</ul>';

                detailContent.innerHTML = `
                    <h2>${model.name}</h2>
                    <pre>${linkedText}</pre>
                    ${filesHtml}
                `;
                detail.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching model details:', error);
                detailContent.innerHTML = `<h2>Error</h2><p>${error.message}</p>`;
                detail.style.display = 'block';
            });
    }

    closeDetail.addEventListener('click', () => {
        detail.style.display = 'none';
    });
});
