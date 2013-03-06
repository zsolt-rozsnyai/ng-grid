/**
    Aggregate class. Similar to the row object but for the aggregate row.
    @constructor
    @param {Object} aggEntity - The entity that represents the aggregate configuration.
    @param {Object} rowFactory - The grid's row Factory.
    @param {int} the configured rowheight - The height of the row in pixels.
 */
ng.Aggregate = function (aggEntity, rowFactory, rowHeight) {
    var self = this;
    self.rowIndex = 0;
    self.offsetTop = self.rowIndex * rowHeight;
    self.entity = aggEntity;
    self.label = aggEntity.gLabel;
    self.field = aggEntity.gField;
    self.depth = aggEntity.gDepth;
    self.parent = aggEntity.parent;
    self.children = aggEntity.children;
    self.aggChildren = aggEntity.aggChildren;
    self.aggIndex = aggEntity.aggIndex;
    self.collapsed = true;
    self.isAggRow = true;
    self.offsetleft = aggEntity.gDepth * 25;
    self.aggLabelFilter = aggEntity.aggLabelFilter;
    /** 
      toggleExpand function. This is called by the template to toggle the collapsed state to show all of the children or hide.
    */
    self.toggleExpand = function() {
        self.collapsed = self.collapsed ? false : true;
        if (self.orig) {
            self.orig.collapsed = self.collapsed;
        }
        self.notifyChildren();
    };
    /** 
      setExpand function. This is called by the template to set the collapsed state.
      @param {boolean} rowFactory - true or false, true to set it collapsed. otherwise, false.
    */
    self.setExpand = function(state) {
        self.collapsed = state;
        self.notifyChildren();
    };
    /** 
      notifyChildren recursive function. this walks down the tree of children and sets their hidden state based on the collapsed state of the aggregate.
    */
    self.notifyChildren = function () {
        var longest = Math.max(rowFactory.aggCache.length, self.children.length);
        for (var i = 0; i < longest; i++) {
            if (self.aggChildren[i]) {
                self.aggChildren[i].entity[NG_HIDDEN] = self.collapsed;
                if (self.collapsed) {
                    self.aggChildren[i].setExpand(self.collapsed);
                }
            }
            if (self.children[i]) {
                self.children[i][NG_HIDDEN] = self.collapsed;
            }
            if (i > self.aggIndex && rowFactory.aggCache[i]) {
                var agg = rowFactory.aggCache[i];
                var offset = (30 * self.children.length);
                agg.offsetTop = self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset;
            }
        };
        rowFactory.renderedChange();
    };
    /** 
      aggClass function. returns the correct arrow class based on the collapsed state
    */
    self.aggClass = function() {
        return self.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded";
    };
    /** 
      totalChildren function. returns the number of children for this aggregate as an integer.
    */
    self.totalChildren = function() {
        if (self.aggChildren.length > 0) {
            var i = 0;
            var recurse = function(cur) {
                if (cur.aggChildren.length > 0) {
                    angular.forEach(cur.aggChildren, function(a) {
                        recurse(a);
                    });
                } else {
                    i += cur.children.length;
                }
            };
            recurse(self);
            return i;
        } else {
            return self.children.length;
        }
    };
    /** 
      copy function. returns a clone of this aggregate for use in the renderedRows array.
    */
    self.copy = function () {
        var ret = new ng.Aggregate(self.entity, rowFactory, rowHeight);
        ret.orig = self;
        return ret;
    };
};