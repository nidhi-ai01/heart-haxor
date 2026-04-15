const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

function walkDir(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) return console.error('Unable to scan directory: ' + err); 

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stat) => {
                if (err) return console.error(err);

                if (stat.isDirectory()) {
                    walkDir(filePath);
                } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) return console.error(err);

                        // Don't replace things that already have { scroll: false }
                        const res = data.replace(/router\.push\(([^,{}]+)\)/g, 'router.push($1, { scroll: false })');
                        
                        if (res !== data) {
                            fs.writeFile(filePath, res, 'utf8', (err) => {
                                if (err) return console.error(err);
                                console.log(`Updated ${filePath}`);
                            });
                        }
                    });
                }
            });
        });
    });
}

walkDir(directoryPath);
