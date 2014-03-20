(function(){

angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', 'uiGridConstants', function ($log, uiGridConstants) {
  var uiGridHeaderCell = {
    priority: 0,
    scope: {
      col: '=',
      row: '=',
      renderIndex: '='
    },
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridHeaderCell',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      $scope.grid = uiGridCtrl.grid;

      // Figure out whether this column is sortable or not
      if (uiGridCtrl.grid.options.enableSorting) {
        if (typeof($scope.col.sortable) !== 'undefined' && $scope.col.sortable !== undefined && $scope.col.sortable === false) {
          $scope.sortable = false;
        }
        else {
          $scope.sortable = true;
        }
      }
      else {
        $scope.sortable = false;
      }

      // If this column is sortable, add a click event handler
      if ($scope.sortable) {
        $elm.on('click', function() {
          // TODO(c0bra): add/remove other columns from sorting...
          uiGridCtrl.grid.resetSortPriorities($scope.col);

          // Figure out the sort direction
          if ($scope.col.sort.direction && $scope.col.sort.direction === uiGridConstants.ASC) {
            $scope.col.sort.direction = uiGridConstants.DESC;
          }
          else {
            $scope.col.sort.direction = uiGridConstants.ASC;
          }

          // TODO(c0bra): if there's a SHIFT-key modifier then add this column to the sorting, but don't unset the other ones
          $scope.col.sort.priority = 0;

          // Rebuild the grid's rows
          uiGridCtrl.refreshRows();
        });

        $scope.$on('$destroy', function () {
          $elm.off('click');
        });
      }
    }
  };

  return uiGridHeaderCell;
}]);

})();