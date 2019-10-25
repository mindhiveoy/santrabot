/**
 * #mergeCloudPackages.js
 *
 * Simple too to automate merging of client side packages to firebase cloud function dependencies.
 *
 * @author Ville Venäläinen
 */
const fs = require('fs');

/**
 * Merge dependencies from client side's packages to functions and make sure that
 * the packages contain the same version with client side.
 */
module.exports = function mergeCloudPackages() {
  fs.readFile('package.json', 'utf8', function(err, mainPackageJson) {
    if (err) {
      throw err;
    }

    fs.readFile('../backend/package.json', 'utf8', function(
      err2,
      functionsPackageJson,
    ) {
      if (err2) {
        throw err2;
      }
      const mainPackage = JSON.parse(mainPackageJson);
      const functionsPackage = JSON.parse(functionsPackageJson);

      for (const name in mainPackage.dependencies) {
        if (name) {
          functionsPackage.dependencies[name] = mainPackage.dependencies[name];
        }
      }

      functionsPackageJson = JSON.stringify(functionsPackage, null, 2);
      fs.writeFileSync('../backend/package.json', functionsPackageJson);
    });
  });
};
