import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;
const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

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
    // The modelPath is URL encoded and can contain slashes
    const modelPath = req.params.modelPath;
    const readmePath = path.join(thirdpartyDir, modelPath, 'readme.txt');
    try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        res.send(readmeContent);
    } catch (error) {
        console.error('Error reading readme file:', error);
        res.status(404).send('Readme not found');
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
