(function(){
// 'use strict';

  angular.module('ui.grid').directive('uiGridNativeScrollbar', ['$log', '$document', 'uiGridConstants', 'gridUtil', function($log, $document, uiGridConstants, gridUtil) {
    var scrollBarWidth = gridUtil.getScrollbarWidth();

    return {
      scope: {
        type: '@'
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var contents = angular.element('<div class="contents">&nbsp;</div>');

        $elm.addClass('ui-grid-native-scrollbar');

        var previousScrollPosition;
        var elmMaxScroll;

        if ($scope.type === 'vertical') {
          // Update the width based on native scrollbar width
          $elm.css('width', scrollBarWidth + 'px');

          $elm.addClass('vertical');

          uiGridCtrl.grid.verticalScrollbarWidth = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollTop;
        }
        else if ($scope.type === 'horizontal') {
          // Update the height based on native scrollbar height
          $elm.css('height', scrollBarWidth + 'px');

          $elm.addClass('horizontal');

          // Save this scrollbar's dimension in the grid properties
          uiGridCtrl.grid.horizontalScrollbarHeight = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollLeft;
        }

        // Save the contents elm inside the scrollbar elm so it sizes correctly
        $elm.append(contents);

        // Save the maximum scroll distance for the element
        if ($scope.type === 'vertical') {
          elmMaxScroll = gridUtil.elementHeight($elm);
        }
        else if ($scope.type === 'horizontal') {
          elmMaxScroll = gridUtil.elementWidth($elm);
        }

        // Update the vertical scrollbar's contents height
        function updateNativeVerticalScrollbar() {
          var h = uiGridCtrl.grid.getCanvasHeight();
          uiGridCtrl.grid.nativeHorizontalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + h + 'px; }';
        }

        function updateNativeHorizontalScrollbar() {
          var w = uiGridCtrl.grid.getCanvasWidth();
          uiGridCtrl.grid.nativeVerticalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.horizontal .contents { width: ' + w + 'px; }';
        }

        if (uiGridCtrl.grid.options.enableNativeScrolling) {
          if ($scope.type === 'vertical') {
            uiGridCtrl.grid.registerStyleComputation({
              priority: 0,
              func: updateNativeVerticalScrollbar
            });
          }
          else if ($scope.type === 'horizontal') {
            uiGridCtrl.grid.registerStyleComputation({
              priority: 0,
              func: updateNativeHorizontalScrollbar
            });
          }
        }

        $elm.on('scroll', function (evt) {
          if ($scope.type === 'vertical') {
            var newScrollTop = $elm[0].scrollTop;

            var yDiff = previousScrollPosition - newScrollTop;

            var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());
            var vertScrollPercentage = newScrollTop / vertScrollLength;

            var args = {
              y: {
                percentage: vertScrollPercentage
              }
            };
            
            uiGridCtrl.fireScrollingEvent(args);

            previousScrollPosition = newScrollTop;
          }
          else if ($scope.type === 'horizontal') {
            
          }
        });
      }
    };
  }]);
})();