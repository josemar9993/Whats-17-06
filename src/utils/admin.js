const config = require('../config');

function getAdminIds() {
  return config.adminIds;
}

function isAdmin(id) {
  return config.adminIds.includes(id);
}

module.exports = { getAdminIds, isAdmin };
