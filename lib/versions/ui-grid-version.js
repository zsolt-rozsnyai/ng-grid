var util = require('../grunt/utils');

exports.currentVersion = util.getVersion();
exports.currentPackage = currentPackage = util.getPackage();
exports.gitRepoInfo = util.getGitRepoInfo();
exports.previousVersions = util.getPreviousVersions();