import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;
const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const modelExtensions = ['.stl', '.3mf'];

app.use(express.static('public'));

async function findModels(currentDir, relativePathParts = []) {
    let models = [];
    try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const hasImage = entries.some(e => !e.isDirectory() && imageExtensions.includes(path.extname(e.name).toLowerCase()));

        if (hasImage && relativePathParts.length > 0) {
            const modelName = relativePathParts.join(' - ');
            const modelPath = relativePathParts.join('/');
            const thumbName = relativePathParts.join('-').replace(/ /g, '_');
            models.push({
                name: modelName,
                path: modelPath,
                thumb: `/thumbs/${thumbName}.jpg`
            });
            return models; // Found model, stop searching deeper
        }

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const nextPathParts = [...relativePathParts, entry.name];
                const nextDir = path.join(currentDir, entry.name);
                models = models.concat(await findModels(nextDir, nextPathParts));
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${currentDir}:`, error);
    }
    return models;
}

app.get('/api/models', async (req, res) => {
  try {
    const models = await findModels(thirdpartyDir);
    res.json(models);
  } catch (error) {
    console.error('Error reading model directory:', error);
    res.status(500).send('Error reading model directory');
  }
});

app.get('/api/model/:modelPath', async (req, res) => {
    const modelPath = req.params.modelPath;
    const modelDir = path.join(thirdpartyDir, modelPath);

    try {
        const entries = await fs.readdir(modelDir);

        // Find readme
        let readmeContent = '';
        try {
            readmeContent = await fs.readFile(path.join(modelDir, 'readme.txt'), 'utf-8');
        } catch (e) {
            // readme.txt not found, which is fine
        }

        // Find model files
        const modelFiles = entries.filter(file => modelExtensions.includes(path.extname(file).toLowerCase()));

        res.json({
            readme: readmeContent,
            files: modelFiles
        });

    } catch (error) {
        console.error('Error reading model details:', error);
        res.status(404).send('Model details not found');
    }
});

// Use a wildcard to capture the full file path for download
app.get('/api/download/*', (req, res) => {
    const filePath = req.params[0];
    const absolutePath = path.join(thirdpartyDir, filePath);

    // Security check: ensure the path is still within the thirdparty directory
    if (!absolutePath.startsWith(thirdpartyDir)) {
        return res.status(403).send('Forbidden');
    }

    res.download(absolutePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(404).send('File not found.');
        }
    });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
