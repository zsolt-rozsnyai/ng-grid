(function(){

angular.module('ui.grid').directive('uiGridColumnMenu', ['$log', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', function ($log, $timeout, $window, $document, gridUtil, uiGridConstants) {

  var uiGridColumnMenu = {
    priority: 0,
    scope: {},
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridColumnMenu',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      var self = this;

      uiGridCtrl.columnMenuCtrl = self;

      // Show the menu
      self.showMenu = function(column, $columnElement) {
        // Swap to this column
        $scope.col = column;

        // Reposition the menu below this column's element
        var left = $columnElement[0].offsetLeft;
        var top = $columnElement[0].offsetTop;

        var height = gridUtil.elementHeight($columnElement, true);
        var width = gridUtil.elementWidth($columnElement, true);

        $scope.menuShown = true;

        // Re-position the menu AFTER it's been shown, so we can calculate the width correctly.
        $timeout(function() {
          var inner = $elm[0].querySelectorAll('.inner');

          var myWidth = gridUtil.elementWidth($elm, true);

          // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
          // Get the column menu right padding
          var paddingRight = parseInt($elm.css('padding-right'), 10);

          $elm.css('left', (left + width - myWidth + paddingRight) + 'px');
          $elm.css('top', (top + height) + 'px');

          // Hide the menu on a click on the document
          $document.on('click', documentClick);
        });
      };

      // Hide the menu
      self.hideMenu = function() {
        $scope.menuShown = false;
      };

      function documentClick() {
        $scope.$apply(self.hideMenu);
        $document.off('click', documentClick);
      }
      
      $window.addEventListener('resize', self.hideMenu);

      $scope.$on('$destroy', function() {
        $window.removeEventListener('resize', self.hideMenu);
        $document.off('click', documentClick);
      });
    }
  };

  return uiGridColumnMenu;

}]);

})();