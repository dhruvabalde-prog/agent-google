const fs = require('fs'); const file = 'app/api/admin/login/route.ts'; let content = fs.readFileSync(file, 'utf8'); content = content.replace(/123456/g, '111111'); fs.writeFileSync(file, content);  
