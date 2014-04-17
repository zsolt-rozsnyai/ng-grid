(function() {

var module = angular.module('ui.grid');

/**
 *  @ngdoc service
 *  @name ui.grid.service:rowSearcher
 *
 *  @description Service for searching/filtering rows based on column value conditions.
 */
module.service('rowSearcher', ['$log', 'uiGridConstants', function ($log, uiGridConstants) {
  var rowSearcher = {};

  // rowSearcher.searchColumn = function searchColumn(condition, item) {
  //   var result;

  //   var col = self.fieldMap[condition.columnDisplay];

  //   if (!col) {
  //       return false;
  //   }
  //   var sp = col.cellFilter.split(':');
  //   var filter = col.cellFilter ? $filter(sp[0]) : null;
  //   var value = item[condition.column] || item[col.field.split('.')[0]];
  //   if (value === null || value === undefined) {
  //       return false;
  //   }
  //   if (typeof filter === "function") {
  //       var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
  //       result = condition.regex.test(filterResults);
  //   }
  //   else {
  //       result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
  //   }
  //   if (result) {
  //       return true;
  //   }
  //   return false;
  // };

  /**
   * @ngdoc function
   * @name searchColumn
   * @methodOf ui.grid.service:rowSearcher
   * @description Process filters on a given column against a given row. If the row meets the conditions on all the filters, return true.
   * @param {Grid} grid Grid to search in
   * @param {GridRow} row Row to search on
   * @param {GridCol} column Column with the filters to use
   * @returns {boolean} Whether the column matches or not.
   */
  rowSearcher.searchColumn = function searchColumn(grid, row, column, termCache) {
    if (typeof(column.filters) !== 'undefined' && column.filters && column.filters.length > 0) {
      for (var i in column.filters) {
        var filter = column.filters[i];

        /*
          filter: {
            term: 'blah', // Search term to search for, could be a string, integer, etc.
            condition: uiGridConstants.filter.CONTAINS // Type of match to do. Defaults to CONTAINS (i.e. looking in a string), but could be EXACT, GREATER_THAN, etc.
            flags: { // Flags for the conditions
              caseSensitive: false // Case-sensitivity defaults to false
            }
          }
        */

        // Default to CONTAINS condition
        if (typeof(filter.condition) === 'undefined' || !filter.condition) {
          filter.condition = uiGridConstants.filter.CONTAINS;
        }

        // Term to search for.
        var term = filter.term;

        // Strip leading and trailing whitespace if the term is a string
        if (typeof(term) === 'string') {
          term = term.trim();
        }

        // Get the column value for this row
        var value = grid.getCellValue(row, column);

        var regexpFlags = '';
        if (!filter.flags || !filter.flags.caseSensitive) {
          regexpFlags += 'i';
        }

        if (filter.condition === uiGridConstants.filter.CONTAINS) {
          var containsRE;
          if (termCache[column.name] && termCache[column.name][i]) {
            containsRE = termCache[column.name][i];
          }
          else {
            containsRE = new RegExp(term, regexpFlags);

            if (!termCache[column.name]) {
              termCache[column.name] = [];
            }
            termCache[column.name][i] = containsRE;
          }

          if (! containsRE.test(value)) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.EXACT) {
          var exactRE;
          if (termCache[column.name] && termCache[column.name][i]) {
            exactRE = termCache[column.name][i];
          }
          else {
            exactRE = new RegExp('^' + term + '$', regexpFlags);

            if (!termCache[column.name]) {
              termCache[column.name] = [];
            }
            termCache[column.name][i] = exactRE;
          }

          if (! exactRE.test(value)) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.GREATER_THAN) {
          if (value <= term) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.GREATER_THAN_OR_EQUAL) {
          if (value < term) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.LESS_THAN) {
          if (value >= term) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.LESS_THAN_OR_EQUAL) {
          if (value > term) {
            return false;
          }
        }
        else if (filter.condition === uiGridConstants.filter.NOT_EQUAL) {
          if (! angular.equals(value, term)) {
            return false;
          }
        }
      }

      return true;
    }
    else {
      // No filter conditions, default to true
      return true;
    }
  };

  /**
   * @ngdoc function
   * @name search
   * @methodOf ui.grid.service:rowSearcher
   * @description Run a search across
   * @param {Grid} grid Grid instance to search inside
   * @param {Array[GridRow]} rows GridRows to filter
   * @param {Array[GridColumn]} columns GridColumns with filters to process
   */
  rowSearcher.search = function search(grid, rows, columns) {
    // Don't do anything if we weren't passed any terms
    if (!rows) {
      return;
    }

    // Create a term cache
    var termCache = [];

    // Build filtered column list
    var filterCols = [];
    columns.forEach(function (col) {
      if (typeof(col.filters) !== 'undefined' && col.filters.length > 0) {
        filterCols.push(col);
      }
    });

    if (filterCols.length > 0) {
      rows.forEach(function (row) {
        var matchesAllColumns = true;

        for (var i in filterCols) {
          var col = filterCols[0];

          if (! rowSearcher.searchColumn(grid, row, col, termCache)) {
            matchesAllColumns = false;

            // Stop processing other terms
            break;
          }
        }

        // Row doesn't match all the terms, don't display it
        if (!matchesAllColumns) {
          row.visible = false;
        }
        else {
          row.visible = true;
        }
      });
    }

    // Reset the term cache
    termCache = [];

    return rows;
  };

  return rowSearcher;
}]);

})();