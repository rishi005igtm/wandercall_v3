const fs = require('fs');
const path = require('path');

function replaceReqAny(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('@Req() req: any')) {
    content = content.replace(/@Req\(\) req: any/g, '@Req() req: RequestWithUser');
    
    // Add import
    // Since controllers are usually in src/modules/<module>/controllers/, depth is usually 3.
    // e.g. src/modules/user/controllers/user.controller.ts
    const parts = filePath.split(path.sep);
    const srcIndex = parts.indexOf('src');
    const depth = parts.length - srcIndex - 2;
    let importPath = '';
    for(let i=0; i<depth; i++) importPath += '../';
    importPath += 'core/interfaces/request-with-user.interface';
    
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIdx = i;
      }
    }
    
    if (lastImportIdx !== -1) {
      lines.splice(lastImportIdx + 1, 0, `import { RequestWithUser } from '${importPath}';`);
    } else {
      lines.unshift(`import { RequestWithUser } from '${importPath}';`);
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Fixed ' + filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      replaceReqAny(fullPath);
    }
  }
}

walk('src/modules');
