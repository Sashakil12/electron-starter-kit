import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const resourcesDir = path.join(projectRoot, 'resources');
const sumatraSource = path.join(projectRoot, 'node_modules', 'pdf-to-printer', 'dist', 'SumatraPDF-3.4.6-32.exe');
const sumatraTarget = path.join(resourcesDir, 'SumatraPDF-3.4.6-32.exe');

// Calculate file hash
function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Ensure resources directory exists
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
}

// Check if we need to copy the file
let needsCopy = true;
if (fs.existsSync(sumatraTarget)) {
    try {
        const sourceHash = getFileHash(sumatraSource);
        const targetHash = getFileHash(sumatraTarget);
        needsCopy = sourceHash !== targetHash;
    } catch (error) {
        console.log('Error comparing files, will copy:', error);
    }
}

// Copy file if needed
if (needsCopy) {
    try {
        fs.copyFileSync(sumatraSource, sumatraTarget);
        console.log('Successfully copied SumatraPDF to resources directory');
    } catch (error) {
        console.error('Error copying file:', error);
        process.exit(1);
    }
} else {
    console.log('SumatraPDF is already up to date in resources directory');
}
