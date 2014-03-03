(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $document, $timeout, uiGridConstants, GridUtil) {
      return {
        // priority: 1000,
        require: '?^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          if (uiGridCtrl === undefined) {
            throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
          }

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;

            var diff = newScrollTop - uiGridCtrl.prevScrollTop;

            // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
            var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());
            var scrollPercentage = (uiGridCtrl.prevScrollTop + diff) / scrollLength;

            uiGridCtrl.adjustScrollVertical(newScrollTop, scrollPercentage);

            // uiGridCtrl.prevScrollTop = newScrollTop;
          });
        }
      };
    }
  ]);

})();