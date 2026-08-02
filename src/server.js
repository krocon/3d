import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/models', async (req, res) => {
  const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
  try {
    const files = await fs.readdir(thirdpartyDir, { withFileTypes: true });
    const models = files
      .filter(file => file.isDirectory())
      .map(dir => ({
        name: dir.name,
        path: path.join('thirdparty', dir.name)
      }));
    res.json(models);
  } catch (error) {
    console.error('Error reading model directory:', error);
    res.status(500).send('Error reading model directory');
  }
});

app.get('/api/model/:modelName', async (req, res) => {
    const modelName = req.params.modelName;
    const readmePath = path.join(process.cwd(), 'thirdparty', modelName, 'readme.txt');
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
