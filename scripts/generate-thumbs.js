import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const thirdpartyDir = path.join(process.cwd(), 'thirdparty');
const publicDir = path.join(process.cwd(), 'public', 'thumbs');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function generateThumbs() {
  try {
    await fs.mkdir(publicDir, { recursive: true });
    const files = await fs.readdir(thirdpartyDir, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        const modelDir = path.join(thirdpartyDir, file.name);
        const modelFiles = await fs.readdir(modelDir);
        const imageFile = modelFiles.find(f => imageExtensions.includes(path.extname(f).toLowerCase()));

        if (imageFile) {
          const inputPath = path.join(modelDir, imageFile);
          const outputPath = path.join(publicDir, `${file.name}.jpg`);
          await sharp(inputPath)
            .resize(200, 200)
            .toFile(outputPath);
          console.log(`Generated thumbnail for ${file.name}`);
        } else {
          console.warn(`No image found for model ${file.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
}

generateThumbs();
