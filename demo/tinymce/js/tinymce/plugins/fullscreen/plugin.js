/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('fullscreen', function(editor) {
	var fullscreenState = false, DOM = tinymce.DOM, deltaHeight, iframeWidth, iframeHeight;

	if (editor.settings.inline) {
		return;
	}

	function getWindowSize() {
		var w, h, win = window, doc = document;
		var body = doc.body;

		// Old IE
		if (body.offsetWidth) {
			w = body.offsetWidth;
			h = body.offsetHeight;
		}

		// Modern browsers
		if (win.innerWidth && win.innerHeight) {
			w = win.innerWidth;
			h = win.innerHeight;
		}

		return {w: w, h: h};
	}

	function toggleFullscreen() {
		var body = document.body, documentElement = document.documentElement;
		var editorContainer, iframe, iframeStyle;

		function resize() {
			DOM.setStyle(iframe, 'height', getWindowSize().h - (editorContainer.clientHeight - iframe.clientHeight));
		}

		fullscreenState = !fullscreenState;

		editorContainer = editor.getContainer().firstChild;
		iframe = editor.getContentAreaContainer().firstChild;
		iframeStyle = iframe.style;

		if (fullscreenState) {
			iframeWidth = iframeStyle.width;
			iframeHeight = iframeStyle.height;
			deltaHeight = editorContainer.clientHeight - iframe.clientHeight;
			iframeStyle.width = iframeStyle.height = '100%';

			DOM.addClass(body, 'mce-fullscreen');
			DOM.addClass(documentElement, 'mce-fullscreen');
			DOM.addClass(editorContainer, 'mce-fullscreen');

			DOM.bind(window, 'resize', resize);
			resize();
		} else {
			iframeStyle.width = iframeWidth;
			iframeStyle.height = iframeHeight;

			DOM.removeClass(body, 'mce-fullscreen');
			DOM.removeClass(documentElement, 'mce-fullscreen');
			DOM.removeClass(editorContainer, 'mce-fullscreen');
			DOM.unbind(window, 'resize', resize);
		}

		editor.fire('FullscreenStateChanged', {state: fullscreenState});
	}

	editor.on('init', function() {
		editor.addShortcut('Ctrl+Alt+F', '', toggleFullscreen);
	});

	editor.addMenuItem('fullscreen', {
		text: 'Fullscreen',
		shortcut: 'Ctrl+Alt+F',
		selectable: true,
		onClick: toggleFullscreen,
		onPostRender: function() {
			var self = this;

			editor.on('FullscreenStateChanged', function(e) {
				self.active(e.state);
			});
		},
		context: 'view'
	});

	editor.addButton('fullscreen', {
		tooltip: 'Fullscreen',
		shortcut: 'Ctrl+Alt+F',
		onClick: toggleFullscreen,
		onPostRender: function() {
			var self = this;

			editor.on('FullscreenStateChanged', function(e) {
				self.active(e.state);
			});
		}
	});

	return {
		isFullscreen: function() {
			return fullscreenState;
		}
	};
});