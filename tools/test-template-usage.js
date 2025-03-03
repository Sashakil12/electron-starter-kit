const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the root directory and test directory
const rootDir = path.resolve(__dirname, '..');
const testDir = path.resolve(rootDir, '..', 'test-template-usage');

console.log('Testing template usage locally...\n');

// Step 1: Create a test directory
console.log('1. Creating test directory...');
try {
  if (fs.existsSync(testDir)) {
    console.log('   Test directory already exists, cleaning it...');
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(testDir, { recursive: true });
  console.log('   ✅ Test directory created');
} catch (error) {
  console.error('   ❌ Failed to create test directory:', error.message);
  process.exit(1);
}

// Step 2: Copy template files (excluding .git, node_modules, etc.)
console.log('\n2. Copying template files...');
try {
  const excludeDirs = ['.git', 'node_modules', 'out', '.vite'];
  
  // Helper function to copy directory recursively
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          copyDir(srcPath, destPath);
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(rootDir, testDir);
  console.log('   ✅ Template files copied');
} catch (error) {
  console.error('   ❌ Failed to copy template files:', error.message);
  process.exit(1);
}

// Step 3: Initialize git repository
console.log('\n3. Initializing git repository...');
try {
  execSync('git init', { cwd: testDir, stdio: 'ignore' });
  console.log('   ✅ Git repository initialized');
} catch (error) {
  console.error('   ❌ Failed to initialize git repository:', error.message);
}

// Step 4: Replace README with TEMPLATE_README
console.log('\n4. Replacing README with TEMPLATE_README...');
try {
  if (fs.existsSync(path.join(testDir, 'TEMPLATE_README.md'))) {
    const templateReadme = fs.readFileSync(path.join(testDir, 'TEMPLATE_README.md'), 'utf8');
    fs.writeFileSync(path.join(testDir, 'README.md'), templateReadme);
    fs.unlinkSync(path.join(testDir, 'TEMPLATE_README.md'));
    console.log('   ✅ README replaced with TEMPLATE_README');
  } else {
    console.log('   ⚠️ TEMPLATE_README.md not found, skipping');
  }
} catch (error) {
  console.error('   ❌ Failed to replace README:', error.message);
}

// Step 5: Update package.json
console.log('\n5. Updating package.json...');
try {
  const packageJsonPath = path.join(testDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update package.json for the new project
  packageJson.name = 'test-template-project';
  packageJson.version = '0.1.0';
  packageJson.description = 'Test project created from template';
  packageJson.repository = {
    type: 'git',
    url: 'https://github.com/yourusername/test-template-project.git'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ package.json updated');
} catch (error) {
  console.error('   ❌ Failed to update package.json:', error.message);
}

console.log('\nTemplate usage test complete!');
console.log(`\nTest directory created at: ${testDir}`);
console.log('You can now:');
console.log('1. Navigate to the test directory');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "npm start" to test the application');
console.log('\nThis simulates what a user would experience when using your template.');
