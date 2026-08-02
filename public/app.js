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
            // Store the unique path to the model to fetch details later
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
        // URL-encode the path to handle special characters and slashes
        const encodedModelPath = encodeURIComponent(model.path);
        fetch(`/api/model/${encodedModelPath}`)
            .then(response => {
                if (!response.ok) {
                    return 'Readme.txt not found for this model.';
                }
                return response.text();
            })
            .then(readme => {
                detailContent.innerHTML = `
                    <h2>${model.name}</h2>
                    <pre>${readme}</pre>
                `;
                detail.style.display = 'block';
            });
    }

    closeDetail.addEventListener('click', () => {
        detail.style.display = 'none';
    });
});
