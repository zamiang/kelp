import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function findAnyTypes(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      findAnyTypes(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(filePath, 'utf8');
      const anyMatches = content.match(/:\s*any/g);
      if (anyMatches) {
        fileList.push({
          file: filePath,
          count: anyMatches.length,
        });
      }
    }
  });

  return fileList;
}

const results = findAnyTypes('./');
console.log('Files with "any" types:', results);
console.log(
  'Total "any" types:',
  results.reduce((sum, r) => sum + r.count, 0),
);
