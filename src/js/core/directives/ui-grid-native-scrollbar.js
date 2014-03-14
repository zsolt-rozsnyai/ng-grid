(function(){
// 'use strict';

  angular.module('ui.grid').directive('uiGridNativeScrollbar', ['$log', '$timeout', '$document', 'uiGridConstants', 'gridUtil', function($log, $timeout, $document, uiGridConstants, gridUtil) {
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

        var elmMaxScroll = 0;

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

        // Get the relevant element dimension now that the contents are in it
        if ($scope.type === 'vertical') {
          elmMaxScroll = gridUtil.elementHeight($elm);
        }
        else if ($scope.type === 'horizontal') {
          elmMaxScroll = gridUtil.elementWidth($elm);
        }
        
        function updateNativeVerticalScrollbar() {
          // Update the vertical scrollbar's content height so it's the same as the canvas
          var h = uiGridCtrl.grid.getCanvasHeight();
          uiGridCtrl.grid.nativeVerticalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + h + 'px; }';

          // If there's a horizontal scrollbar
          if (uiGridCtrl.grid.horizontalScrollbarHeight && uiGridCtrl.grid.horizontalScrollbarHeight > 0) {
            // Get the viewport height
            var scrollbarHeight = uiGridCtrl.grid.getViewportHeight();
            // scrollbarHeight = scrollbarHeight - uiGridCtrl.grid.horizontalScrollbarHeight;

            // Update the vertical scrollbar so it doesn't overlap/underlap the horizontal scrollbar
            uiGridCtrl.grid.nativeVerticalScrollbarStyles = uiGridCtrl.grid.nativeVerticalScrollbarStyles +
              ' .grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical { height: ' + scrollbarHeight + 'px; }';

            elmMaxScroll = scrollbarHeight;
          }
        }

        function updateNativeHorizontalScrollbar() {
          var w = uiGridCtrl.grid.getCanvasWidth();
          uiGridCtrl.grid.nativeHorizontalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.horizontal .contents { width: ' + w + 'px; }';
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

        function scrollEvent(evt) {
          if ($scope.type === 'vertical') {
            var newScrollTop = $elm[0].scrollTop;

            var yDiff = previousScrollPosition - newScrollTop;

            var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            // Subtract the h. scrollbar height from the vertical length if it's present
            if (uiGridCtrl.grid.horizontalScrollbarHeight && uiGridCtrl.grid.horizontalScrollbarHeight > 0) {
              vertScrollLength = vertScrollLength - uiGridCtrl.grid.horizontalScrollbarHeight;
            }

            var vertScrollPercentage = newScrollTop / vertScrollLength;

            var args = {
              target: $elm,
              y: {
                percentage: vertScrollPercentage
              }
            };
            
            $log.debug('Fire scroll event');
            uiGridCtrl.fireScrollingEvent(args);

            previousScrollPosition = newScrollTop;
          }
          else if ($scope.type === 'horizontal') {
            
          }
        }

        $elm.on('scroll', scrollEvent);

        $elm.on('$destroy', function() {
          $elm.off('scroll');
        });

        function gridScroll(evt, args) {
          // Don't listen to our own scroll event!
          if (args.target && args.target === $elm) {
            return;
          }

          if ($scope.type === 'vertical') {
            if (args.y && typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
              var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

              var newScrollTop = Math.max(0, args.y.percentage * vertScrollLength);
              
              $elm[0].scrollTop = newScrollTop;
            }
          }
          else if ($scope.type === 'horizontal') {
            
          }
        }

        var gridScrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, gridScroll);
        $scope.$on('$destroy', gridScrollDereg);
      }
    };
  }]);
})();