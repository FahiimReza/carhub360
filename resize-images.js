const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'assets/car-images';
const sizes = [400, 800, 1200];

async function resizeImage(filePath) {
    const dirName = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));

    for (const size of sizes) {
        const outputPath = path.join(dirName, `${baseName}-${size}.webp`);
        try {
            await sharp(filePath)
                .resize(size)
                .toFile(outputPath);
            console.log(`Created: ${outputPath}`);
        } catch (error) {
            console.error(`Error processing ${filePath} for size ${size}:`, error);
        }
    }
}

async function processDirectory(directory) {
    const files = await fs.promises.readdir(directory, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(directory, file.name);
        if (file.isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.isFile() && file.name.endsWith('.webp')) {
            await resizeImage(fullPath);
        }
    }
}

async function main() {
    console.log(`Starting image resizing in ${inputDir}...`);
    if (!fs.existsSync(inputDir)) {
        console.error(`Input directory ${inputDir} does not exist.`);
        return;
    }
    await processDirectory(inputDir);
    console.log('Image resizing complete.');
}

main();