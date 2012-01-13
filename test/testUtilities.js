	window.loadScript = function(src, path, assets, jsAssets, cssAssets, env, envPath, cb) {
		var cacheBust = '?r=' + new Date().getTime();
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.src = "../gettit.js" + cacheBust;
		script.setAttribute('data-assets', assets);
		script.setAttribute('data-env-path', path || '/gettit/test/assets/');
		script.setAttribute('data-env', env);
		script.setAttribute('data-callback', cb || '');
		script.setAttribute('data-js-assets', 
			_.reduce(jsAssets && jsAssets.split(',') || [], function(memo, asset, i) {
				return memo + (i>0?',':'') + asset + cacheBust;
			}, ''));
		script.setAttribute('data-css-assets', 
			_.reduce(cssAssets && cssAssets.split(',') || [], function(memo, asset, i) {
				return memo + (i>0?',':'') + asset + cacheBust;
			}, ''));
		var head = document.getElementsByTagName('head')[0] || document.documentElement;
		head.insertBefore(script, head.firstChild);
	};


