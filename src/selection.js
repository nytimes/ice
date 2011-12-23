(function() {

var exports = this, Selection;

Selection = function() {
	this._selection = null;
	
	if(ice.env.frame)
		this._selection = rangy.getIframeSelection(ice.env.frame);
	else
		this._selection = rangy.getSelection();
};

Selection.prototype = {

	/**
	 * Returns the selection object for the current browser.
	 */
	_getSelection: function() {
		if(this._selection)
			this._selection.refresh();
		else if(ice.env.frame)
			this._selection = rangy.getIframeSelection(ice.env.frame);
		else
			this._selection = rangy.getSelection();
		return this._selection;
	},

	/**
	 * Creates a range object.
	 */
	createRange: function() {
		 return rangy.createRange(ice.env.document);
	},

	/**
	 * Returns the range object at the specified position. The current range object
	 * is at position 0. Note - currently only setting single range in `addRange` so
	 * position 0 will be the only allocation filled.
	 */
	getRangeAt: function(pos) {
		this._selection.refresh();
		try {
			return this._selection.getRangeAt(pos);
		} catch(e) {
			return this.createRange();
		}
	},

	/**
	 * Adds the specified range to the current selection. Note - only supporting setting
	 * a single range, meaning the last range gets evicted.
	 */
	addRange: function(range) {
		this._selection = this._selection || this._getSelection();
		this._selection.setSingleRange(range);
		this._selection.ranges = [range];
		return;
	}
};

exports.ice.Selection = Selection;

}).call(this);
