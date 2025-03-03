const fs = require('fs');
const path = require('path');

// Define the root directory
const rootDir = path.resolve(__dirname, '..');

// Define required files for a good template
const requiredFiles = [
  'LICENSE',
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/workflows/build.yml',
  '.github/FUNDING.yml',
  '.gitignore',
  '.npmrc',
  'package.json'
];

// Define template-specific checks
const templateChecks = [
  {
    file: 'README.md',
    check: content => content.includes('Template Usage') || content.includes('Use this template'),
    message: 'README.md should include template usage instructions'
  },
  {
    file: 'package.json',
    check: content => {
      const pkg = JSON.parse(content);
      return pkg.repository && 
             pkg.keywords && 
             pkg.keywords.includes('template');
    },
    message: 'package.json should include repository information and "template" keyword'
  }
];

console.log('Checking template repository configuration...\n');

// Check required files
console.log('1. Checking required files:');
let missingFiles = 0;

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const exists = fs.existsSync(filePath);
  
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
  
  if (!exists) {
    missingFiles++;
  }
});

if (missingFiles > 0) {
  console.log(`\n   ❌ Missing ${missingFiles} required file(s)`);
} else {
  console.log('\n   ✅ All required files are present');
}

// Perform template-specific checks
console.log('\n2. Performing template-specific checks:');
let failedChecks = 0;

templateChecks.forEach(check => {
  const filePath = path.join(rootDir, check.file);
  let result = false;
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      result = check.check(content);
    }
  } catch (error) {
    console.error(`   Error checking ${check.file}:`, error.message);
    result = false;
  }
  
  console.log(`   ${result ? '✓' : '✗'} ${check.message}`);
  
  if (!result) {
    failedChecks++;
  }
});

if (failedChecks > 0) {
  console.log(`\n   ❌ Failed ${failedChecks} template-specific check(s)`);
} else {
  console.log('\n   ✅ All template-specific checks passed');
}

// Check package.json for template-related fields
console.log('\n3. Checking package.json configuration:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  const checks = [
    { condition: !!packageJson.repository, message: 'Repository field is present' },
    { condition: !!packageJson.keywords && packageJson.keywords.includes('template'), message: 'Keywords include "template"' },
    { condition: !!packageJson.license, message: 'License field is present' },
    { condition: !!packageJson.author, message: 'Author field is present' }
  ];
  
  let failedPkgChecks = 0;
  
  checks.forEach(check => {
    console.log(`   ${check.condition ? '✓' : '✗'} ${check.message}`);
    if (!check.condition) {
      failedPkgChecks++;
    }
  });
  
  if (failedPkgChecks > 0) {
    console.log(`\n   ❌ Failed ${failedPkgChecks} package.json check(s)`);
  } else {
    console.log('\n   ✅ All package.json checks passed');
  }
} catch (error) {
  console.error('   Error reading package.json:', error.message);
}

console.log('\nTemplate check complete!');
