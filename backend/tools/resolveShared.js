/**
 * Resolve @shared -scope -package mappings in compiles js -files to point to local compiled filed in lib -folder
 *
 * @author Ville Venäläinen
 */
const fs = require('fs');
const { resolve, relative, dirname } = require('path');
const libFolder = resolve(__dirname, '..', 'lib');

/**
 * Recurse all directories
 */
const recurseDirectories = (dir, filelist) => {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = recurseDirectories(dir + '/' + file, filelist);
    } else {
      filelist.push(resolve(dir, file));
    }
  });
  return filelist;
};

console.info('Starting to reroute @shared -scope packages to compiled files.');

let sourceFiles = [];

recurseDirectories(libFolder, sourceFiles);

sourceFiles = sourceFiles.filter(value => value.endsWith('.js'));

let rewrites = 0;
/*
 * Replace mappings to global shared code to point to compiles @shared -folder
 */
for (const sourceFile of sourceFiles) {
  const fullPath = sourceFile;
  let file = fs.readFileSync(fullPath, 'utf8');

  const dirName = dirname(fullPath);
  const relativePath = relative(dirName, libFolder);
  var result = file.replace(/\@shared\//g, relativePath + '/@shared/');

  if (result.includes('require("admin")')) {
    // calculate relative path to admin
    const relativePath = relative(dirName, resolve(libFolder, 'backend/src/admin'));
    result = result.replace('require("admin")', `require("${relativePath}")`);
  }
  if (result !== file) {
    rewrites++;
    fs.writeFile(fullPath, result, 'utf8', err => {
      if (err) {
        return console.log(err);
      }
    });
  }
}

console.info(`Rerouting done with ${rewrites} rewrites.`);
