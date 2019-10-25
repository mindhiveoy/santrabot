const fs = require('fs');

module.exports = function readPackageVersionNumber() {
  const packageJson = fs.readFileSync('package.json');

  const packageObject = JSON.parse(packageJson);
  if (packageObject) {
    return packageObject.version;
  }
  return 'version info missing';
};
