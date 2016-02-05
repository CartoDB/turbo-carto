'use strict';

function columnName (column) {
  return column.replace('[', '').replace(']', '');
}

module.exports = columnName;
