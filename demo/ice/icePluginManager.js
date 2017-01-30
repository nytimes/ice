(function() {

var exports = this;

var IcePluginManager = function(ice_instance) {

  this.plugins = {},
  this.pluginConstructors = {},
  this.keyPressListeners = {},
  this.activePlugin = null,
  this.pluginSets = {},
  this.activePluginSet = null,

  this._ice = ice_instance;
};

IcePluginManager.prototype = {

  getPluginNames: function() {
    var plugins = [];
    for (var name in this.plugins) {
      plugins.push(name);
    }
    return plugins;
  },

  addPluginObject: function(pluginName, pluginObj) {
    this.plugins[pluginName] = pluginObj;
  },

  addPlugin: function(name, pluginConstructor) {
    if (typeof pluginConstructor !== 'function') {
      throw Error('IcePluginException: plugin must be a constructor function');
    }

    if (ice.dom.isset(this.pluginConstructors[name]) === false) {
      this.pluginConstructors[name] = pluginConstructor;
    }
  },

  loadPlugins: function(plugins, callback) {
    if (plugins.length === 0) {
      callback.call(this);
    } else {
      var plugin = plugins.shift();
      if (typeof plugin === 'object') {
        plugin = plugin.name;
      }

      if (ice.dom.isset(ice._plugin[plugin]) === true) {
        this.addPlugin(plugin, ice._plugin[plugin]);
        this.loadPlugins(plugins, callback);
      } else {
        throw new Error('plugin was not included in the page: ' + plugin);
      }
    }
  },

  _enableSet: function(name) {
    this.activePluginSet = name;
    var pSetLen = this.pluginSets[name].length;
    for (var i = 0; i < pSetLen; i++) {
      var plugin   = this.pluginSets[name][i];
      var pluginName = '';
      if (typeof plugin === 'object') {
        pluginName = plugin.name;
      } else {
        pluginName = plugin;
      }

      var pluginConstructor = this.pluginConstructors[pluginName];
      if (pluginConstructor) {
        var pluginObj = new pluginConstructor(this._ice);
        this.plugins[pluginName] = pluginObj;

        if (ice.dom.isset(plugin.settings) === true) {
          pluginObj.setSettings(plugin.settings);
        }

        pluginObj.start();
      }
    }
  },

  setActivePlugin: function(name) {
    this.activePlugin = name;
  },

  getActivePlugin: function() {
    return this.activePlugin;
  },

  _getPluginName: function(pluginConstructor) {
    var fn = pluginConstructor.toString();
    var start = 'function '.length;
    var name = fn.substr(start, (fn.indexOf('(') - start));
    return name;
  },

  /**
   * Removes specified plugin.
   */
  removePlugin: function(plugin) {
    if (this.plugins[plugin]) {
      // Call the remove fn of the plugin incase it needs to do cleanup.
      this.plugins[plugin].remove();
    }
  },

  /**
   * Returns the plugin object for specified plugin name.
   */
  getPlugin: function(name) {
    return this.plugins[name];

  },

  /**
   * Add a new set of plugins.
   */
  usePlugins: function(name, plugins, callback) {
    var self = this;
    if (ice.dom.isset(plugins) === true) {
      this.pluginSets[name] = plugins;
    } else {
      this.pluginSets[name] = [];
    }
    var clone = this.pluginSets[name].concat([]);
    this.loadPlugins(clone, function() {
      self._enableSet(name);
      if(callback) callback.call(this);
    });
  },

  disablePlugin: function(name) {
    this.plugins[name].disable();
  },

  isPluginElement: function(element) {
    for (var i in this.plugins) {
      if (this.plugins[i].isPluginElement) {
        if (this.plugins[i].isPluginElement(element) === true) {
          return true;
        }
      }
    }
    return false;
  },

  fireKeyPressed: function(e) {
    if (this._fireKeyPressFns(e, 'all_keys') === false) {
      return false;
    }

    var eKeys = [];
    if (e.ctrlKey === true || e.metaKey === true) {
      eKeys.push('ctrl');
    }

    if (e.shiftKey === true) {
      eKeys.push('shift');
    }

    if (e.altKey === true) {
      eKeys.push('alt');
    }

    switch (e.keyCode) {
      case 13:
        eKeys.push('enter');
      break;

      case ice.dom.DOM_VK_LEFT:
        eKeys.push('left');
      break;

      case ice.dom.DOM_VK_RIGHT:
        eKeys.push('right');
      break;

      case ice.dom.DOM_VK_UP:
        eKeys.push('up');
      break;

      case ice.dom.DOM_VK_DOWN:
        eKeys.push('down');
      break;

      case 9:
        eKeys.push('tab');
      break;

      case ice.dom.DOM_VK_DELETE:
        eKeys.push('delete');
      break;

      default:
        var code;
        if (e.keyCode) {
          code = e.keyCode;
        } else if (e.which) {
          code = e.which;
        }

        // Other characters (a-z0-9..).
        if (code) {
          eKeys.push(String.fromCharCode(code).toLowerCase());
        }
      break;
    }//end switch

    var eKeysStr = eKeys.sort().join('+');

    return this._fireKeyPressFns(e, eKeysStr);

  },

  _fireKeyPressFns: function(e, eKeysStr) {
    if (this.keyPressListeners[eKeysStr]) {
      var ln = this.keyPressListeners[eKeysStr].length;
      for (var i = 0; i < ln; i++) {
        var listener = this.keyPressListeners[eKeysStr][i];
        var eventFn  = listener.fn;
        var plugin   = listener.plugin;
        var data   = listener.data;

        if (eventFn) {
          if (ice.dom.isFn(eventFn) === true) {
            if (eventFn.call(plugin, e, data) === true) {
              ice.dom.preventDefault(e);
              return false;
            }
          } else if (plugin[eventFn] && plugin[eventFn].call(plugin, e, data) === true) {
            ice.dom.preventDefault(e);
            return false;
          }
        }
      }
    }

    return true;
  },

  fireSelectionChanged: function(range) {
    for (var i in this.plugins) {
      this.plugins[i].selectionChanged(range);
    }
  },

  fireNodeInserted: function(node, range) {
    for (var i in this.plugins) {
      if (this.plugins[i].nodeInserted(node, range) === false) {
        return false;
      }
    }
  },

  fireNodeCreated: function(node, option) {
    for (var i in this.plugins) {
      if (this.plugins[i].nodeCreated(node, option) === false) {
        return false;
      }
    }
  },

  fireCaretPositioned: function() {
    for (var i in this.plugins) {
      this.plugins[i].caretPositioned()
    }
  },

  fireClicked: function(e) {
    var val = true;
    for (var i in this.plugins) {
      if (this.plugins[i].clicked(e) === false) {
        val = false;
      }
    }
    return val;
  },

  fireMouseDown: function(e) {
    var val = true;
    for (var i in this.plugins) {
      if (this.plugins[i].mouseDown(e) === false) {
        val = false;
      }
    }
    return val;
  },

  fireKeyDown: function(e) {
    var val = true;
    for (var i in this.plugins) {
      if (this.plugins[i].keyDown(e) === false) {
        val = false;
      }
    }
    return val;
  },

  fireKeyPress: function(e) {
    var val = true;
    for (var i in this.plugins) {
      if (this.plugins[i].keyPress(e) === false) {
        val = false;
      }
    }
    return val;
  },

  fireEnabled: function(enabled) {
    for (var i in this.plugins) {
      this.plugins[i].setEnabled(enabled);
    }
  },

  fireDisabled: function(disabled) {
    for (var i in this.plugins) {
      this.plugins[i].setDisabled(disabled);
    }
  },

  fireCaretUpdated: function() {
    for (var i in this.plugins) {
      if (this.plugins[i].caretUpdated) {
        this.plugins[i].caretUpdated();
      }
    }
  }
};

exports._plugin = {};
exports.IcePluginManager = IcePluginManager;

}).call(this.ice);
