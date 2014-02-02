/**
 * Created by Tim on 2/1/14.
 */
(function(){
    'use strict';

    angular.module('ui.grid.grouping').factory('uiGridAggregationService', ['groupConstants', '$parse'], function(constants, $parse){
        var service = {};
        var parsedData = [];
        var parentCache = [];
        var numberOfAggregates = 0;

        //magical recursion. it works. I swear it. I figured it out in the shower one day.
        var parseGroupData = function(g) {
            if (g.values) {
                for (var x = 0; x < g.values.length; x++){
                    // get the last parent in the array because that's where our children want to be
                    parentCache[parentCache.length - 1].children.push(g.values[x]);
                    //add the row to our return array
                    parsedData.push(g.values[x]);
                }
            } else {
                for (var prop in g) {
                    // exclude the meta properties.
                    if (prop === constants.FIELD || prop === constants.DEPTH || prop === constants.COLUMN) {
                        continue;
                    } else if (g.hasOwnProperty(prop)) {
                        //build the aggregate row
                        var agg = {
                            gField: g[constants.FIELD],
                            gLabel: prop,
                            gDepth: g[constants.DEPTH],
                            isAggRow: true,
                            '_ng_hidden_': false,
                            children: [],
                            aggChildren: [],
                            aggIndex: numberOfAggregates,
                            aggLabelFilter: g[constants.COLUMN].aggLabelFilter
                        };
                        numberOfAggregates++;
                        //set the aggregate parent to the parent in the array that is one less deep.
                        agg.parent = parentCache[agg.depth - 1];
                        // if we have a parent, set the parent to not be collapsed and append the current agg to its children
                        if (agg.parent) {
                            agg.parent.collapsed = false;
                            agg.parent.aggChildren.push(agg);
                        }
                        // add the aggregate row to the parsed data.
                        parsedData.push(agg);
                        // the current aggregate now the parent of the current depth
                        parentCache[agg.depth] = agg;
                        // dig deeper for more aggregates or children.
                        parseGroupData(g[prop]);
                    }
                }
            }
        };
        //Shuffle the data into their respective groupings.
        var getGrouping = function(groups, rows, cols, autoCollapse) {
            numberOfAggregates = 0;
            var groupedData = {};

            function filterCols(cols, group) {
                return cols.filter(function(c) {
                    return c.field === group;
                });
            }

            for (var x = 0; x < rows.length; x++) {
                var model = rows[x]; //just the row or row.entity?
                if (!model) {
                    return groupedData;
                }
                rows[x][constants.HIDDEN] = autoCollapse;
                var ptr = groupedData;

                for (var y = 0; y < groups.length; y++) {
                    var group = groups[y];

                    var col = filterCols(cols, group)[0];

                    var val = $parse(group)(model);
                    val = val ? val.toString() : 'null';
                    if (!ptr[val]) {
                        ptr[val] = {};
                    }
                    if (!ptr[constants.FIELD]) {
                        ptr[constants.FIELD] = group;
                    }
                    if (!ptr[constants.DEPTH]) {
                        ptr[constants.DEPTH] = y;
                    }
                    if (!ptr[constants.COLUMN]) {
                        ptr[constants.COLUMN] = col;
                    }
                    ptr = ptr[val];
                }
                if (!ptr.values) {
                    ptr.values = [];
                }
                ptr.values.push(rows[x]);
            }
            return groupedData;
        };

        service.getAggregates = function(groups, filteredRows, columns, autoCollapse){
            if (groups.length > 0) {
                var g = getGrouping(groups, filteredRows, columns, autoCollapse);
                parseGroupData(g);
                return parsedData;
            }
        };
        return service;
    });
})();