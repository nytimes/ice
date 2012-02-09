(function() {
	tinymce.create('tinymce.plugins.IceRevisionsPlugin', {

		publish_button_id: 'publish',
		save_button_id: 'save-post',
		
		/**
		 * Plugin initialization - register buttons, commands, and take care of setup.
		 */
		init: function(ed, url) {
			var self = this, ice = ed.getParam('ice', {});

			// use another textarea to submit the unmodified content then remove all tracking and comment tags from the content
			ed.onInit.add(function(ed) {
				ed.dom.bind(
					self.publish_button_id,
					'mousedown',
					function() {
						var DOM = tinymce.DOM, content;

						if ( ed.id != 'content' || !ice.isTracking )
							return;

						if ( ed.isHidden() )
							ed.load();

						content = ed.getContent();
						if ( ed.getParam('wpautop', true) && typeof(switchEditors) != 'undefined' )
							content = switchEditors.pre_wpautop( content );

						DOM.get('ice-revisions-content').value = content;

						// remove change tracking spans
						ed.execCommand('iceacceptall');
					}
				);

				ed.dom.bind(
					self.save_button_id,
					'mousedown',
					function() {
						var DOM = tinymce.DOM, content;

						if ( ed.id != 'content' || !ice.isTracking )
							return;

						if ( ed.isHidden() ) {
							content = DOM.get('content').value;
						} else {
							content = ed.getContent();
							if ( ed.getParam('wpautop', true) && typeof(switchEditors) != 'undefined' )
								content = switchEditors.pre_wpautop( content );
						}

						DOM.get('ice-revisions-content').value = content;
					}
				);
			});

			// init Ice after MCE is ready and content is loaded and re-init Ice when switching from HTML to Visual mode
			ed.onLoadContent.add(function(ed, o) {
				if ( ed.id != 'content' && ed.id != 'wp_mce_fullscreen' ) // only on the main editor 
					return;

				if ( ed.isHidden() )
					return;

				if ( o.initial )
					setTimeout( function(){
						ed.execCommand('initializeice');
					}, 1000);
				else
					ed.execCommand('ice_initenv');
			});
		}
	});

	tinymce.PluginManager.add('icerevisions', tinymce.plugins.IceRevisionsPlugin);
})();
