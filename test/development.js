$(document).ready(function() {

	module("script[data-env=development]");

	test('assets.yml:javascripts/stylesheets bundles', 4, function() {
		var scriptCount = document.getElementsByTagName('script').length;
		var stylesheetCount = document.getElementsByTagName('link').length;
		stop();
		loadScript('', '', 'dev1/assets.yml', 'dev1/js/testj1.js', 'dev1/css/testc1.css', 'development');	

		// Setup a function for scripts to call when they are executed (in order)
		var count = 0;
		window.dev1 = function(fromScript) {
			equal(count++, fromScript);
		};

		setTimeout(function() {
			equal(document.getElementsByTagName('script').length, scriptCount + 3);
			equal(document.getElementsByTagName('link').length, stylesheetCount + 2);
			equal
			start();  
		}, 1200)  
	})

	test('assets.yml:template_function (micro template compiling)', 2, function() {
		stop();
		loadScript('', '', 'dev2/micro-assets.yml', 'dev2/js/testj1.js', '', 'development');	

		setTimeout(function() {
			equal(window.JST.test1({test1:'eat',test2:'fork'}), '<div>eat me</div>\n<div>fork socket</div>\n');
			equal(window.JST.test2({test:'east'}), '<div>east coast hackers</div>\n');
			start();  
		}, 1200)  
	})


	test('assets.yml:template_function:_.template', 2, function() {
		stop();
		loadScript('', '', 'dev2/underscore-assets.yml', 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.2.2/underscore-min.js,dev2/js/testj1.js', '', 'development');

		setTimeout(function() {
			equal(window.JST.test3({test1:'eat',test2:'fork'}), '<div>eat me</div><div>fork socket</div>');
			equal(window.JST.test4({test:'east'}), '<div>east coast hackers</div>');
			start();  
		}, 1200)  
	})

	test('assets.yml:template_namespace', 2, function() {
		stop();
		loadScript('', '', 'dev2/namespace-assets.yml', 'dev2/js/testj1.js', '', 'development');

		setTimeout(function() {
			equal(window.dev2.test1({test1:'eat',test2:'fork'}), '<div>eat me</div>\n<div>fork socket</div>\n');
			equal(window.dev2.test2({test:'east'}), '<div>east coast hackers</div>\n');
			start();  
		}, 1200)  
	})

	test('assets.yml:template_extension', 2, function() {
		stop();
		loadScript('', '', 'dev2/extension-assets.yml', 'dev2/js/testj1.js', '', 'development');

		setTimeout(function() {
			equal(window.dev2.test3({test1:'eat',test2:'fork'}), '<div>eat me</div>\n<div>fork socket</div>\n');
			equal(window.dev2.test4({test:'east'}), '<div>east coast hackers</div>\n');
			start();  
		}, 1200)  
	})

	test('[data-callback]', 1, function() {  
		stop();
		var test = 0;
		window.devCallback1 = function() {
			test = 1;
		};
		loadScript('', '', 'dev2/micro-assets.yml', 'dev2/js/testj1.js', '', 'development', '', 'window.devCallback1');	
		setTimeout(function() {
			equal(test, 1);
			start();  
		}, 1000)  
	})

	test('[data-callback] (no templates)', 1, function() {  
		stop();
		var test = 0;
		window.dev1 = function(){};
		window.devCallback2 = function() {
			test = 1;
		};
		loadScript('', '', 'dev1/assets.yml', 'dev1/js/testj1.js', 'dev1/css/testc1.css', 'development', '', 'window.devCallback2');
		setTimeout(function() {
			equal(test, 1);
			start();  
		}, 1000)  
	})

});
