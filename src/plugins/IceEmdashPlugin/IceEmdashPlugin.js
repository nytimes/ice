(function() {

var exports = this;

/**
 * When active, this plugin will convert two successively typed dashes, within
 * the ice block element, into an emdash. 
 */
var IceEmdashPlugin = function(ice_instance) {
	this._ice = ice_instance;
};

IceEmdashPlugin.prototype = {

	keyDown: function(e) {
		// Catch dashes.
		if(ice.dom.isBrowser('mozilla')) {
			var version = parseInt(ice.dom.browser().version);
			if ( (version > 14 && e.keyCode === 173) || (version <= 14 && e.keyCode === 109) ) {
				return this.convertEmdash(e);
			}
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
					c = range.toHtml();
					if(c === '-') {
						// Extract the last character/dash and insert an emdash
						range.extractContents();
						range.collapse();
						var mdash = this._ice.env.document.createTextNode('\u2014');
						if (this._ice.isTracking) {
							this._ice._insertNode(mdash, range);
						} else {
							range.insertNode(mdash);
							/* TO be reverted once mozilla fixes FF 15 issue */
							range.setStart(mdash, 1);
							range.collapse(true);
							/* FINISH revert */
						}
						/* TO be reverted once mozilla fixes FF 15 issue
						range = this._ice.getCurrentRange();
						range.moveStart(ice.dom.CHARACTER_UNIT, 1);
						range.collapse(true);
						this._ice.env.selection.addRange(range);
						*/
						this._ice._preventKeyPress = true;
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
exports._plugin.IceEmdashPlugin = IceEmdashPlugin;

}).call(this.ice);