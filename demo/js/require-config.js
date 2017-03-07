var require = {
    "paths": {
      "jquery": "http://code.jquery.com/jquery-2.1.4.min",
      'tinymce': "tinymce/js/tinymce/tinymce",
      "tinymce.jquery": "tinymce/js/tinymce/jquery.tinymce.min",
   //    "rangy": "rangy/rangy-core",
   //    "ice": "ice/ice",
   //    "icePluginManager": "ice/icePluginManager",
   //    "IceAddTitlePlugin":'ice/plugins/IceAddTitlePlugin/IceAddTitlePlugin',
	  // "IceCopyPastePlugin":'ice/plugins/IceCopyPastePlugin/IceCopyPastePlugin.js',
	  // "IceEmdashPlugin":'ice/plugins/IceEmdashPlugin/IceEmdashPlugin.js',
	  // "IceSmartQuotesPlugin":'ice/plugins/IceSmartQuotesPlugin/IceSmartQuotesPlugin.js',

  "jquery1.9": "http://code.jquery.com/jquery-2.1.4.min",
	//"jquery-migrate" : "http://code.jquery.com/jquery-migrate-1.0.0",
  "rangy-core": "../../lib/rangy/rangy-core",
  "polyfills": "../../src/polyfills",
  "ice":"../../src/ice",
  "dom":"../../src/dom",
  "icePlugin":"../../src/icePlugin",
  "icePluginManager":"../../src/icePluginManager",
  "bookmark":"../../src/bookmark",
  "selection":"../../src/selection",
  "IceAddTitlePlugin":"../../src/plugins/IceAddTitlePlugin/IceAddTitlePlugin",
  "IceCopyPastePlugin":"../../src/plugins/IceCopyPastePlugin/IceCopyPastePlugin",
  "IceEmdashPlugin":"../../src/plugins/IceEmdashPlugin/IceEmdashPlugin",
  "IceSmartQuotesPlugin":"../../src/plugins/IceSmartQuotesPlugin/IceSmartQuotesPlugin",
  "tinymce":"../../lib/tinymce/jscripts/tinymce4/tinymce",
    },
    "shim": {
    	"jquery2.1": {
    		exports: "$"
    	},
      "rangy-core": {
        exports: "window.rangy"
      },
      "dom": {
        deps:['ice'],
        exports: "dom"
      },
      "selection" : {
        exports: "Selection"
      },
      "bookmark": {
        exports: "Bookmark"
      },
      "ice" : {
        exports: "ice"
      },
      "icePluginManager": {deps: ['ice'] },
      "IceAddTitlePlugin":{ deps: ['icePluginManager']},
      "IceCopyPastePlugin":{ deps: ['icePluginManager']},
      "IceEmdashPlugin":{ deps: ['icePluginManager']},
      "IceSmartQuotesPlugin":{ deps: ['icePluginManager']},
    	"tinymce": {
    		exports: "tinymce",
    		init: function() {
    			this.tinymce.DOM.events.domLoaded = true;
    			return this.tinymce;
    		}
    	},
    	"tinymce.jquery" :{
    		deps: ['jquery']
    	}
    }
};
