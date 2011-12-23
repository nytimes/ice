(function() {

var exports = this;

var IcePlugin = function(ice_instance) {
	this._ice = ice_instance;
};

IcePlugin.ALL_EVENTS = 0;
IcePlugin.NODES_DELETED	 = 1;
IcePlugin.NODES_INSERTED = 2;
IcePlugin.NODES_CHANGED	= 3;
IcePlugin.SELECTION_CHANGED = 4;

IcePlugin.prototype = {

	start: function() {},
	clicked: function(e) {
		return true;
	},
	mouseDown: function(e) {
		return true;
	},
	keyDown: function(e) {
		return true;
	},
	keyPress: function(e) {
		return true;
	},
	selectionChanged: function(range) {},
	setEnabled: function(enabled) {},
	setDisabled: function(enabled) {},
	caretUpdated: function() {},
	nodeInserted: function(node, range) {},
	nodeCreated: function(node) {},
	caretPositioned: function() {},
	remove: function() {
		this._ice.removeKeyPressListener(this);
	},
	setSettings: function(settings) {}
};

exports.ice.IcePlugin = IcePlugin;

}).call(this);
