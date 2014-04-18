(function() {

var module = angular.module('ui.grid');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 *  @ngdoc service
 *  @name ui.grid.service:rowSearcher
 *
 *  @description Service for searching/filtering rows based on column value conditions.
 */
module.service('rowSearcher', ['$log', 'uiGridConstants', function ($log, uiGridConstants) {
  var defaultCondition = uiGridConstants.filter.STARTS_WITH;

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
   * @name getTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Get the term from a filter
   * Trims leading and trailing whitespace
   * @param {object} filter object to use
   * @returns {object} Parsed term
   */
  rowSearcher.getTerm = function getTerm(filter) {
    if (typeof(filter.term) === 'undefined') { return filter.term; }
    
    var term = filter.term;

    // Strip leading and trailing whitespace if the term is a string
    if (typeof(term) === 'string') {
      term = term.trim();
    }

    return term;
  };

  /**
   * @ngdoc function
   * @name stripTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Remove leading and trailing asterisk (*) from the filter's term
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.stripTerm = function stripTerm(filter) {
    var term = rowSearcher.getTerm(filter);

    if (typeof(term) === 'string') {
      return escapeRegExp(term.replace(/(^\*|\*$)/g, ''));
    }
    else {
      return term;
    }
  };

  /**
   * @ngdoc function
   * @name guessCondition
   * @methodOf ui.grid.service:rowSearcher
   * @description Guess the condition for a filter based on its term
   * <br>
   * Defaults to STARTS_WITH. Uses CONTAINS for strings beginning and ending with *s (*bob*).
   * Uses STARTS_WITH for strings ending with * (bo*). Uses ENDS_WITH for strings starting with * (*ob).
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.guessCondition = function guessCondition(filter) {
    if (typeof(filter.term) === 'undefined' || !filter.term) {
      return defaultCondition;
    }

    var term = rowSearcher.getTerm(filter);
    
    // Term starts with and ends with a *, use 'contains' condition
    if (/^\*[\s\S]+?\*$/.test(term)) {
      return uiGridConstants.filter.CONTAINS;
    }
    // Term starts with a *, use 'ends with' condition
    else if (/^\*/.test(term)) {
      return uiGridConstants.filter.ENDS_WITH;
    }
    // Term ends with a *, use 'starts with' condition
    else if (/\*$/.test(term)) {
      return uiGridConstants.filter.STARTS_WITH;
    }
    // Default to default condition
    else {
      return defaultCondition;
    }
  };

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
    var filters = [];

    if (typeof(column.filters) !== 'undefined' && column.filters && column.filters.length > 0) {
      filters = column.filters;
    }
    else if (typeof(column.filter) !== 'undefined' && column.filter) {
      var condition = rowSearcher.guessCondition(column.filter);

      filters[0] = {
        term: column.filter.term,
        condition: condition,
        flags: {
          caseSensitive: false
        }
      };
    }
    
    for (var i in filters) {
      var filter = filters[i];

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
      var term = rowSearcher.stripTerm(filter);

      if (term === null || term === undefined || term === '') {
        continue;
      }

      // Get the column value for this row
      var value = grid.getCellValue(row, column);

      var regexpFlags = '';
      if (!filter.flags || !filter.flags.caseSensitive) {
        regexpFlags += 'i';
      }

      if (filter.condition === uiGridConstants.filter.STARTS_WITH) {
        var startswithRE;
        if (termCache[column.field] && termCache[column.field][i]) {
          startswithRE = termCache[column.field][i];
        }
        else {
          startswithRE = new RegExp('^' + term, regexpFlags);

          if (!termCache[column.field]) {
            termCache[column.field] = [];
          }
          termCache[column.field][i] = startswithRE;
        }

        if (! startswithRE.test(value)) {
          return false;
        }
      }
      else if (filter.condition === uiGridConstants.filter.ENDS_WITH) {
        var endswithRE;
        if (termCache[column.field] && termCache[column.field][i]) {
          endswithRE = termCache[column.field][i];
        }
        else {
          endswithRE = new RegExp(term + '$', regexpFlags);

          if (!termCache[column.field]) {
            termCache[column.field] = [];
          }
          termCache[column.field][i] = endswithRE;
        }

        if (! endswithRE.test(value)) {
          return false;
        }
      }
      else if (filter.condition === uiGridConstants.filter.CONTAINS) {
        var containsRE;
        if (termCache[column.field] && termCache[column.field][i]) {
          containsRE = termCache[column.field][i];
        }
        else {
          containsRE = new RegExp(term, regexpFlags);

          if (!termCache[column.field]) {
            termCache[column.field] = [];
          }
          termCache[column.field][i] = containsRE;
        }

        if (! containsRE.test(value)) {
          return false;
        }
      }
      else if (filter.condition === uiGridConstants.filter.EXACT) {
        var exactRE;
        if (termCache[column.field] && termCache[column.field][i]) {
          exactRE = termCache[column.field][i];
        }
        else {
          exactRE = new RegExp('^' + term + '$', regexpFlags);

          if (!termCache[column.field]) {
            termCache[column.field] = [];
          }
          termCache[column.field][i] = exactRE;
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
    // }
    // else {
    //   // No filter conditions, default to true
    //   return true;
    // }
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
    $log.debug('search!');
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
      else if (typeof(col.filter) !== 'undefined' && col.filter && typeof(col.filter.term) !== 'undefined' && col.filter.term) {
        filterCols.push(col);
      }
    });

    if (filterCols.length > 0) {
      rows.forEach(function (row) {
        var matchesAllColumns = true;

        for (var i in filterCols) {
          var col = filterCols[i];

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