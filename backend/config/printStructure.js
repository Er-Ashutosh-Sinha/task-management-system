const fs = require('fs');
const path = require('path');

function printSkeleton(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    // Skip node_modules and .git for cleaner output
    if (item === 'node_modules' || item === '.git') return;

    if (stats.isDirectory()) {
      console.log(`├── ${item}/`);
      // Print only the first level inside this folder
      const nested = fs.readdirSync(fullPath);
      nested.forEach(n => {
        const nestedPath = path.join(fullPath, n);
        if (fs.statSync(nestedPath).isDirectory()) {
          console.log(`│   └── ${n}/`);
        } else {
          console.log(`│   └── ${n}`);
        }
      });
    } else {
      console.log(`├── ${item}`);
    }
  });
}

// Only print in development
if (process.env.NODE_ENV === 'development') {
  const rootPath = path.resolve(__dirname, '../../'); // Adjust if this file moves
  console.log('--- Project Structure --- \n');
  printSkeleton(rootPath);
  console.log('\n--- End of Structure ---\n');
}

module.exports = printSkeleton;
