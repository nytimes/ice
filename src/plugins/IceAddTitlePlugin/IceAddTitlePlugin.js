(function() {

var exports = this, ice = this.ice, IceAddTitlePlugin;
	
IceAddTitlePlugin = function(ice_instance) {
	this._ice = ice_instance;
};

IceAddTitlePlugin.prototype = {
	nodeCreated: function(node) {
		node.setAttribute('title', 'Modified by ' + node.getAttribute(this._ice.userNameAttribute) 
				+ ' - ' + ice.dom.date('m/d/Y h:ia', parseInt(node.getAttribute(this._ice.timeAttribute))));
	}
};

ice.dom.noInclusionInherits(IceAddTitlePlugin, ice.IcePlugin);
exports.ice._plugin.IceAddTitlePlugin = IceAddTitlePlugin;

}).call(this);
