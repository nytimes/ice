(function() {

var exports = this, ice = this.ice;

/**
 * When active, this plugin will convert two successively typed dashes, within
 * the ice block element, into an emdash. 
 */
var IceEmdashPlugin = function(ice_instance) {
	this._ice = ice_instance;
}

IceEmdashPlugin.prototype = {

	keyDown: function(e) {
		// Catch dashes.
		if(ice.dom.isBrowser('mozilla')) {
			if(e.keyCode === 109)
				return this.convertEmdash(e);
		} else if(e.keyCode === 189) {
			return this.convertEmdash(e);
		}
		return true;
	},
	
	convertEmdash: function(e) {
		var range = this._ice.getCurrentRange();
		if(range.collapsed) {
			try {
				// Move the start back one character so we can enclose the range around the previous character to check if it is a dash
				range.moveStart(ice.dom.CHARACTER_UNIT, -1);
				// Get the parent block element for the start and end containers
				var startBlock = ice.dom.getParents(range.startContainer, this._ice.blockEl)[0];
				var endBlock = ice.dom.getParents(range.endContainer, this._ice.blockEl)[0];
				// Make sure that the start and end containers aren't in different blocks, or that the start isn't in a delete.
				if(startBlock === endBlock && !this._ice.getIceNode(range.startContainer, 'deleteType')) {
					// Get the last character and check to see if it is a dash.
					var fragment = range.cloneContents();
					var c = ice.dom.getNodeTextContent(fragment);
					if(c === '-') {
						// Extract the last character/dash and insert an emdash
						range.extractContents();
						range.collapse();
						var mdash = ice.env.document.createTextNode('\u2014');
						this._ice.insert(mdash, range);
						range = this._ice.getCurrentRange();
						range.moveStart(ice.dom.CHARACTER_UNIT, 1);
						range.collapse(true);
						ice.env.selection.addRange(range);
						return false;
					}
				}
			} catch(e) {}
			range.collapse();
		}
		return true;
	}

};

ice.dom.noInclusionInherits(IceEmdashPlugin, ice.IcePlugin);
exports.ice._plugin.IceEmdashPlugin = IceEmdashPlugin;

}).call(this);
