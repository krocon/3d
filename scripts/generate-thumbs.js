import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
const publicDir = path.join(process.cwd(), 'public', 'thumbs');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function findModelsAndGenerateThumbs(currentDir, relativePathParts = [], stats = { total: 0, generated: 0 }) {
    try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const imageFiles = entries.filter(e => !e.isDirectory() && imageExtensions.includes(path.extname(e.name).toLowerCase()));

        if (imageFiles.length > 0 && relativePathParts.length > 0) {
            stats.total++;
            const modelName = relativePathParts.join(' - ');
            const outputFileName = relativePathParts.join('-').replace(/ /g, '_');

            // Generate main thumbnail for gallery (using the first image)
            const mainInputPath = path.join(currentDir, imageFiles[0].name);
            const mainOutputPath = path.join(publicDir, `${outputFileName}.jpg`);
            try {
                await sharp(mainInputPath)
                    .resize(300, 300, { fit: 'cover' })
                    .toFormat('jpeg')
                    .toFile(mainOutputPath);
                stats.generated++;
            } catch (err) {
                console.error(`Failed main thumb for ${modelName}:`, err.message);
            }

            // Generate thumbnail for all images in this model
            for (const img of imageFiles) {
                const imgInputPath = path.join(currentDir, img.name);
                const safeImgName = img.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const imgOutputPath = path.join(publicDir, `${outputFileName}__${safeImgName}.jpg`);
                try {
                    await sharp(imgInputPath)
                        .resize(300, 300, { fit: 'cover' })
                        .toFormat('jpeg')
                        .toFile(imgOutputPath);
                } catch (err) {
                    console.error(`Failed detail thumb for ${img.name}:`, err.message);
                }
            }

            console.log(`[OK] Generated thumbnails for ${modelName} (${imageFiles.length} images)`);
            return;
        }

        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'stl') {
                const nextPathParts = [...relativePathParts, entry.name];
                const nextDir = path.join(currentDir, entry.name);
                await findModelsAndGenerateThumbs(nextDir, nextPathParts, stats);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${currentDir}:`, error);
    }
}

async function generateThumbs() {
    try {
        await fs.mkdir(publicDir, { recursive: true });

        // If --clean flag is provided or on full rebuild, remove old thumbnails
        if (process.argv.includes('--clean')) {
            console.log('Cleaning existing thumbnails directory...');
            const existingFiles = await fs.readdir(publicDir);
            for (const file of existingFiles) {
                await fs.unlink(path.join(publicDir, file));
            }
        }

        console.log('Scanning models and generating thumbnails...');
        const stats = { total: 0, generated: 0 };
        await findModelsAndGenerateThumbs(thirdpartyDir, [], stats);
        console.log(`Thumbnail generation complete. Models processed: ${stats.total}, Thumbnails generated: ${stats.generated}`);
    } catch (error) {
        console.error('Error generating thumbnails:', error);
    }
}

generateThumbs();
