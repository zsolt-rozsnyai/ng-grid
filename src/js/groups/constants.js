/**
 * * Created by Tim on 2/1/14.
 */
// constant for sorting direction
(function(){
    angular.module('ui.grid.grouping', ['ui.grid']).constant('groupConstants', {
        FIELD: '_ui_field_',
        DEPTH: '_ui_depth_',
        HIDDEN: '_ui_hidden_',
        COLUMN: '_ui_column_'
    });
})();