$(document).ready(function() {

	module("script[data-env=production]");

	// Runs the following test when `debug_assets=true` is a url parameter
	if(location.search.indexOf('debug_assets=true') > -1) {
	
		test('?debug_assets=true', 5, function() {

			var scriptCount = document.getElementsByTagName('script').length;
			var stylesheetCount = document.getElementsByTagName('link').length;
			stop();
			loadScript('', '', 'prod2/assets.yml', 'prod2/js/testj1.js,prod2/js/testj2.js ', 'prod2/css/testc1.css,prod2/css/testc2.css', 'production');	

			// Setup a function for scripts to call when they are executed (in order)
			var count = 0;
			window.prod2 = function(fromScript) {
				equal(count++, fromScript);
			};

			setTimeout(function() {
				equal(document.getElementsByTagName('script').length, scriptCount + 4);
				equal(document.getElementsByTagName('link').length, stylesheetCount + 3);
				start();  
			}, 1200)  
		})

	} else {
		// Run non-debug_assets production tests.
		
		test('[data-js-assets] with full urls', 5, function() {  
			var scriptCount = document.getElementsByTagName('script').length;
			stop();
			loadScript('', '', '', 
				'prod3/js/test1.js,prod3/js/test2.js,'+
				'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.2.2/underscore-min.js,'+
				'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.5.0/backbone-min.js', '', 'production');

			// Setup a function for scripts to call when they are executed (in order)
			var count = 0;
			window.prod3 = function(fromScript) {
				equal(count++, fromScript);
			};

			setTimeout(function() {
				equal(document.getElementsByTagName('script').length, scriptCount + 5);
				ok(window._);
				ok(window.Backbone);
				start();  
			}, 1000);
		})
		
		test('[data-js-assets]', 4, function() {  
			var scriptCount = document.getElementsByTagName('script').length;
			stop();
			loadScript('', '', '', ' prod1/js/test1.js, prod1/js/test2.js,prod1/js/test3.js', '', 'production');

			// Setup a function for scripts to call when they are executed (in order)
			var count = 0;
			window.prod1 = function(fromScript) {
				equal(count++, fromScript);
			};

			setTimeout(function() {
				equal(document.getElementsByTagName('script').length, scriptCount + 4);
				start();  
			}, 1000)  
		})


		test('[data-css-assets]', 1, function() {  
			var stylesheetCount = document.getElementsByTagName('link').length;
			stop();
			loadScript('', '', '', '', 'prod1/css/test1.css,prod1/css/test2.css,prod1/css/test3.css', 'production');	
			setTimeout(function() {
				equal(document.getElementsByTagName('link').length, stylesheetCount + 3);
				start();  
			}, 1000)  
		})

		test('[data-css-assets] with full urls', 1, function() {  
			var stylesheetCount = document.getElementsByTagName('link').length;
			stop();
			loadScript('', '', '', '', 
				'prod3/css/test1.css,prod3/css/test2.css,'+
				'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css,'+
				'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/black-tie/jquery-ui.css', 'production');	
			setTimeout(function() {
				equal(document.getElementsByTagName('link').length, stylesheetCount + 4);
				start();  
			}, 1000)  
		})

		test('[data-callback]', 1, function() {  
			stop();
			var test = 0;
			window.prod1 = function() {};
			window.prodCallback4 = function() {
				test = 1;
			};
			loadScript('', '', 'prod2/assets.yml', 'prod1/js/test1.js', 'prod1/css/test1.css', 'production', '', 'window.prodCallback4');	
			setTimeout(function() {
				equal(test, 1);
				start();  
			}, 1000)  
		})

	}

});
