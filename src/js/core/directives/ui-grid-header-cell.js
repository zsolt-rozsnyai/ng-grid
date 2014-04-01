(function(){

angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$timeout', 'uiGridConstants', function ($log, $timeout, uiGridConstants) {
  // Do stuff after mouse has been down this many ms on the header cell
  var mousedownTimeout = 1000;

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

      // Hide the menu by default
      $scope.showMenu = false;

      // Store a reference to menu element
      var $colMenu = angular.element( $elm[0].querySelectorAll('.ui-grid-header-cell-menu') );

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

      function handleClick() {
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
      }

      function toggleMenu() {
        if ($scope.showMenu) {
          // If the menu is visible, hide it
          $scope.showMenu = false;
        }
        else {
          // Place the menu
          // $colMenu.

          // Show the menu for this column
          $scope.showMenu = true;
        }
      }

      var cancelMousedownTimeout;
      var mousedownStartTime = 0;
      $elm.on('mousedown', function(evt) {
        mousedownStartTime = (new Date()).getTime();

        cancelMousedownTimeout = $timeout(function() { }, mousedownTimeout);

        cancelMousedownTimeout.then(function () {
          $scope.showMenu = !$scope.showMenu;
        });
      });

      // If this column is sortable, add a click event handler
      if ($scope.sortable) {
        $elm.on('click', function() {
          $timeout.cancel(cancelMousedownTimeout);

          var mousedownEndTime = (new Date()).getTime();
          var mousedownTime = mousedownEndTime - mousedownStartTime;

          if (mousedownTime > mousedownTimeout) {
            $log.debug('long click!');
          }
          else {
            $log.debug('short click!');
            handleClick();
          }
        });

        $scope.$on('$destroy', function () {
          $elm.off('click');
          $elm.off('mousedown');
          $timeout.cancel(cancelMousedownTimeout);
        });
      }
    }
  };

  return uiGridHeaderCell;
}]);

})();