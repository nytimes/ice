(function() {

var exports = this;

var IcePlugin = function(ice_instance) {
  this._ice = ice_instance;
};

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
  nodeCreated: function(node, options) {},
  caretPositioned: function() {},
  remove: function() {
    this._ice.removeKeyPressListener(this);
  },
  setSettings: function(settings) {}
};

exports.IcePlugin = IcePlugin;

}).call(this.ice);
