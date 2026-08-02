import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
const publicDir = path.join(process.cwd(), 'public', 'thumbs');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function findModelsAndGenerateThumbs(currentDir, relativePathParts = []) {
    try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const imageFile = entries.find(e => !e.isDirectory() && imageExtensions.includes(path.extname(e.name).toLowerCase()));

        // If there's an image in the current directory, treat it as a single model
        if (imageFile) {
            const modelName = relativePathParts.join(' - ');
            const inputPath = path.join(currentDir, imageFile.name);
            const outputFileName = relativePathParts.join('-').replace(/ /g, '_');
            const outputPath = path.join(publicDir, `${outputFileName}.jpg`);

            await sharp(inputPath)
                .resize(200, 200)
                .toFile(outputPath);
            console.log(`Generated thumbnail for ${modelName}`);
            return; // Stop searching deeper in this branch
        }

        // Otherwise, look in subdirectories
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const nextPathParts = [...relativePathParts, entry.name];
                const nextDir = path.join(currentDir, entry.name);
                await findModelsAndGenerateThumbs(nextDir, nextPathParts);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${currentDir}:`, error);
    }
}

async function generateThumbs() {
    try {
        await fs.mkdir(publicDir, { recursive: true });
        const topLevelDirs = await fs.readdir(thirdpartyDir, { withFileTypes: true });
        for (const dir of topLevelDirs) {
            if (dir.isDirectory()) {
                await findModelsAndGenerateThumbs(path.join(thirdpartyDir, dir.name), [dir.name]);
            }
        }
    } catch (error) {
        console.error('Error generating thumbnails:', error);
    }
}

generateThumbs();
