import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findSumatraPDF } from '../src/utils/sumatra-finder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const resourcesDir = path.join(projectRoot, 'resources');

// Find SumatraPDF executable
const sumatra = findSumatraPDF({ projectRoot });
const sumatraSource = sumatra.path;
const sumatraTarget = path.join(resourcesDir, sumatra.filename);

console.log(`Found SumatraPDF at: ${sumatraSource}`);

// Ensure resources directory exists
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
}

// Copy file if needed
try {
    if (fs.existsSync(sumatraTarget)) {
        fs.unlinkSync(sumatraTarget);
    }
    fs.copyFileSync(sumatraSource, sumatraTarget);
    console.log('Successfully copied SumatraPDF to resources directory');
} catch (error) {
    console.error('Error copying file:', error);
    process.exit(1);
}
