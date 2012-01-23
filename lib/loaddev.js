/**
 * Load the ice dev files
 */
(function() {

	var files = [
		'lib/rangy-1.2/rangy-core.js',
		'lib/rangy-1.2/rangy-cssclassapplier.js',
		'lib/rangy-1.2/rangy-selectionsaverestore.js',
		'lib/rangy-1.2/rangy-serializer.js',
		'src/ice.js',
		'src/dom.js',
		'src/icePlugin.js',
		'src/icePluginManager.js',
		'src/bookmark.js',
		'src/selection.js',
		'src/plugins/IceAddTitlePlugin/IceAddTitlePlugin.js',
		'src/plugins/IceCopyPastePlugin/IceCopyPastePlugin.js',
		'src/plugins/IceEmdashPlugin/IceEmdashPlugin.js',
		'src/plugins/IceSmartQuotesPlugin/IceSmartQuotesPlugin.js'
	];
	
	var path = window.location.href.substring(0, window.location.href.lastIndexOf('/icehub/') + 8), i = 0;
	//console.log(path)
	
	(function() {
		var args = arguments;
		var doNext = function() {
			if(++i < files.length) args.callee();
			else if(window.initIce) window.initIce();
		};
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		if(script.readyState)
			script.onreadystatechange = function() { if(this.readyState == 'complete') doNext(); }
		else
			script.onload = doNext;
		script.src = path + files[i] + '?r=' + Math.random();
		head.appendChild(script);
	})();
	
})();
