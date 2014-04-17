(function() {

var module = angular.module('ui.grid');

module.service('rowSearcher', ['$log', 'uiGridConstants', function ($log, uiGridConstants) {
  var rowSearcher = {};

  rowSearcher.searchColumn = function searchColumn(condition, item) {
    var result;

    var col = self.fieldMap[condition.columnDisplay];

    if (!col) {
        return false;
    }
    var sp = col.cellFilter.split(':');
    var filter = col.cellFilter ? $filter(sp[0]) : null;
    var value = item[condition.column] || item[col.field.split('.')[0]];
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof filter === "function") {
        var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
        result = condition.regex.test(filterResults);
    }
    else {
        result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
    }
    if (result) {
        return true;
    }
    return false;
  };

  rowSearcher.search = function search(grid, rows, columns) {
    if (!rows) {
      return;
    }

    // Build filtered column list
    var filterCols = [];
    columns.forEach(function (col) {
      
    });

    rows.forEach(function (row) {
      
    });

    return rows;
  };

  return rowSearcher;
}]);

})();