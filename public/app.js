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
            thumb.dataset.modelName = model.name;
            thumb.innerHTML = `
                <img src="/thumbs/${model.name}.jpg" alt="${model.name}">
                <p>${model.name}</p>
            `;
            thumb.addEventListener('click', () => showDetail(model.name));
            gallery.appendChild(thumb);
        });
    }

    filter.addEventListener('input', () => {
        const filterValue = filter.value.toLowerCase();
        const filteredModels = models.filter(model => model.name.toLowerCase().includes(filterValue));
        renderGallery(filteredModels);
    });

    function showDetail(modelName) {
        fetch(`/api/model/${modelName}`)
            .then(response => response.text())
            .then(readme => {
                detailContent.innerHTML = `
                    <h2>${modelName}</h2>
                    <pre>${readme}</pre>
                `;
                detail.style.display = 'block';
            });
    }

    closeDetail.addEventListener('click', () => {
        detail.style.display = 'none';
    });
});
