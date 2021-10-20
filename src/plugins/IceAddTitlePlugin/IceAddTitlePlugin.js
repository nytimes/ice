(function() {

var exports = this, IceAddTitlePlugin;
  
IceAddTitlePlugin = function(ice_instance) {
  this._ice = ice_instance;
};

IceAddTitlePlugin.prototype = {
  nodeCreated: function(node, option) {
    // jshint -W014
    node.setAttribute('title', (option.action || 'Modified') + ' by ' + node.getAttribute(this._ice.userNameAttribute)
        + ' - ' + ice.dom.date('m/d/Y h:ia', parseInt(node.getAttribute(this._ice.timeAttribute))));
    // jshint +W014
  }
};

ice.dom.noInclusionInherits(IceAddTitlePlugin, ice.IcePlugin);
exports._plugin.IceAddTitlePlugin = IceAddTitlePlugin;

}).call(this.ice);
