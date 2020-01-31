(function() {
	tinymce.create('tinymce.plugins.IcePlugin', {

		/**
		 * Tinymce initializtion API for ice. An `ice` object is expected
		 * with any of the following params.
		 */
		deleteTag: 'span',
		insertTag: 'span',
		deleteClass: 'del',
		insertClass: 'ins',
		changeIdAttribute: 'data-cid',
		userIdAttribute: 'data-userid',
		userNameAttribute: 'data-username',
		timeAttribute: 'data-time',
		preserveOnPaste: 'p',
		user: { name: 'Unknown User', id: Math.random() },
		isTracking: true,
		contentEditable: true,
		css: 'css/ice.css',
		manualInit: false,
		scriptVersion: new Date().getTime(),
		afterInit: function() {},
		afterClean: function(body) { return body; },
		beforePasteClean: function(body) { return body; },
		afterPasteClean: function(body) { return body; },
		//buttons to activate/deactivate
		trackChangesButton: function () { },
        	showChangesButton: function () { },
        	acceptButton: function () { },
        	rejectButton: function () { },
        	acceptAllButton: function () { },
        	rejectAllButton: function () { },

		/**
		 * Plugin initialization - register buttons, commands, and take care of setup.
		 */
		init: function(ed, url) {
			
			var self = this,
				changeEditor = null;

			
			// make sure only the plugin is handling this event	and not the editor		
			ed.on('keydown', function(e) {
				// prevent the delete key and backspace keys from firing twice
				if((e.keyCode == 46 || e.keyCode == 8) && self.isTracking) {
					e.preventDefault();
			    }
			});
				
			/**
			 * After the editor renders, initialize ice.
			 */
			ed.on('init', function(e) {
				var dom = ed.dom;
				
				tinymce.extend(self, ed.getParam('ice'));
				self.insertSelector = '.' + self.insertClass;
				self.deleteSelector = '.' + self.deleteClass;

				// Add insert and delete tag/attribute rules.
				// Important: keep `id` in attributes list in case `insertTag` is a `span` - tinymce uses temporary spans with ids.
				ed.serializer.addRules(self.insertTag + '[id|class|title|'+self.changeIdAttribute + '|' + self.userIdAttribute + '|' + self.userNameAttribute + '|' + self.timeAttribute + ']');
				ed.serializer.addRules(self.deleteTag + '[id|class|title|'+self.changeIdAttribute + '|' + self.userIdAttribute + '|' + self.userNameAttribute + '|' + self.timeAttribute + ']');
				// Temporary tags to act as placeholders for deletes.
				ed.serializer.addRules('tempdel[data-allocation]');

				dom.loadCSS(self.css.indexOf('://') > 0 ? self.css : (url + '/' + self.css));
				
				/**
				 * TODO/FIXME - Investigate further into why this doesn't work...
				 * 
				tinymce.ScriptLoader.load(url + '/js/ice.min.js', function() {
					ed.execCommand('initializeice');
				});
				 *
				 * Script load manually, instead.
				 */
				var startIce = function() {
					if(!self.manualInit) ed.execCommand('initializeice');
				};
				var script = document.createElement('script');
				script.type = 'text/javascript';
				if (script.readyState) script.onreadystatechange = function() { startIce(); };
				else script.onload = startIce;
				script.src = url + '/js/ice.min.js?version='+self.scriptVersion;
				document.getElementsByTagName('head')[0].appendChild(script);

				// Setting the Show/Hide Changes button to active
				//ed.controlManager.setActive('ice_toggleshowchanges', true);
				//if(self.isTracking)
					//ed.controlManager.setActive('ice_togglechanges', true);
			});
			
			/**
			 * Instantiates a new ice instance using the given `editor` or the current editor body.
			 * TODO/FIXME: There is some timing conflict that forces us to initialize ice after a
			 * timeout (maybe mce isn't completely initialized???). Research further...
			 */
			ed.addCommand('initializeice', function(editor) {
				ed = editor || ed;
				tinymce.DOM.win.setTimeout(function() {
					changeEditor = new ice.InlineChangeEditor({
						element: ed.getBody(),
						isTracking: self.isTracking,
						contentEditable: self.contentEditable,
						changeIdAttribute: self.changeIdAttribute,
						userIdAttribute: self.userIdAttribute,
						userNameAttribute: self.userNameAttribute,
						timeAttribute: self.timeAttribute,
						currentUser: {
							id: self.user.id,
							name: self.user.name
						},
						plugins: [
							'IceEmdashPlugin', 
							'IceAddTitlePlugin', 
							'IceSmartQuotesPlugin',
							{
								name: 'IceCopyPastePlugin',
								settings: {
									pasteType: 'formattedClean',
									preserve: self.preserveOnPaste,
									beforePasteClean: self.beforePasteClean,
									afterPasteClean: self.afterPasteClean
								}
							}
						],
						changeTypes: {
							insertType: {tag: self.insertTag, alias: self.insertClass},
							deleteType: {tag: self.deleteTag, alias: self.deleteClass}
						}
					}).startTracking();
					
					
					// since onEvent doesn't seem to exist in TinyMce4 override the events as necessary
					ed.on('mousedown', function(e) {
						return changeEditor.handleEvent(e);
					});
					
					ed.on('keyup', function(e) {
						return changeEditor.handleEvent(e);
					});
					
					ed.on('keydown', function(e) {
						return changeEditor.handleEvent(e);
					});
					
					ed.on('keypress', function(e) {
						return changeEditor.handleEvent(e);
					});
					
					setTimeout(function() { self.afterInit.call(self); }, 10);
				}, 500);
			});
			

            //   _____                                                 _
            //  /  __ \                                               | |
            // | /  \/  ___   _ __ ___   _ __ ___    __ _  _ __    __| |
            // | |     / _ \ | '_ ` _ \ | '_ ` _ \  / _` || '_ \  / _` |
            // | \__/\| (_) || | | | | || | | | | || (_| || | | || (_| |
            // \____/ \___/ |_| |_| |_||_| |_| |_| \__,_||_| |_| \__,_|
            //
            //

			/**
			 * Re-initializes ice's environment - resets the environment variables for the current page
			 * and re-initializes the internal ice range. This is useful after tinymce hides/switches
			 * the current editor, like when toggling to the html source view and back.
			 */
			ed.addCommand('ice_initenv', function() {
				changeEditor.initializeEnvironment();
				changeEditor.initializeRange();
			});
			
			/**
			 * Cleans change tracking tags out of the given, or editor, body. Removes deletes and their
			 * inner contents; removes insert tags, keeping their inner content in place.
			 * @param el optional html string or node body.
			 * @return clean body, void of change tracking tags.
			 */
			ed.addCommand('icecleanbody', function(el) {
				var body = changeEditor.getCleanContent(el || ed.getContent(), self.afterClean, self.beforeClean);
				return body;
			});
			
			/**
			 * Returns true if delete placeholders are in place; otherwise, false.
			 */
			ed.addCommand('ice_hasDeletePlaceholders', function() {
				return changeEditor.isPlaceholdingDeletes;
			});
			
			/**
			 * This command will drop placeholders in place of delete tags in the editor body and
			 * store away the references which can be reverted back with the `ice_removeDeletePlaceholders`.
			 */
			ed.addCommand('ice_addDeletePlaceholders', function() {
				return changeEditor.placeholdDeletes();
			});
			
			/**
			 * Replaces delete placeholders with their respective delete nodes.
			 */
			ed.addCommand('ice_removeDeletePlaceholders', function() {
				return changeEditor.revertDeletePlaceholders();
			});
			
			/**
			 * Insert content with change tracking tags. 
			 * 
			 * The `insert` object parameter can contain the following properties: 
			 *   { `item`, `range` }
			 * Where `item` is the item to insert (string, or textnode)
			 * and `range` is an optional range to insert into.
			 */
			ed.addCommand('iceinsert', function(insert) {
				insert = insert || {};
				changeEditor.insert(insert.item, insert.range);
			});
			
			/**
			 * Deletes content with change tracking tags. 
			 * 
			 * The `del` object parameter can contain the following properties:
			 *   { `right`, `range` }
			 * Where `right` is an optional boolean parameter, where true deletes to the right, false to the left
			 * and `range` is an optional range to delete in.
			 * 
			 * If the current Selection isn't collapsed then the `right` param is ignored 
			 * and a selection delete is performed.
			 */
			ed.addCommand('icedelete', function(del) {
				del = del || {};
				changeEditor.deleteContents(del.right, del.range);
			});

			/**
			 * Set the current ice user with the incoming `user`.
			 */
			ed.addCommand('ice_changeuser', function(user) {
				changeEditor.setCurrentUser(user);
			});

			/**
			 * Uses the given `node` or finds the current node where the selection resides, and in the 
			 * case of a delete tag, removes the node, or in the case of an insert, removes the outer 
			 * insert tag and keeps the contents in place.
			 */
			ed.addCommand('iceaccept', function(node) {
				ed.undoManager.add();
				changeEditor.acceptChange(node || ed.selection.getNode());
				cleanup();
			});
			
			/**
			 * Uses the given `node` or finds the current node where the selection resides, and in the 
			 * case of a delete tag, removes the outer delete tag and keeps the contents in place, or 
			 * in the case of an insert, removes the node.
			 */
			ed.addCommand('icereject', function(node) {
				ed.undoManager.add();
				changeEditor.rejectChange(node || ed.selection.getNode());
				cleanup();
			});
			
			/**
			 * Cleans the editor body of change tags - removes delete nodes, and removes outer insert 
			 * tags keeping the inner content in place. Defers to cleaning technique.
			 */
			ed.addCommand('iceacceptall', function() {
				ed.undoManager.add();
				changeEditor.acceptAll();
				cleanup();
			});
			
			/**
			 * Cleans the editor body of change tags - removes inserts, and removes outer delete tags, 
			 * keeping the inner content in place.
			 */
			ed.addCommand('icerejectall', function() {
				ed.undoManager.add();
				changeEditor.rejectAll();
				cleanup();
			});
			
			/**
			 * Adds a class to the editor body which will toggle, hide or show, track change styling.
			 */
			ed.addCommand('ice_toggleshowchanges', function() {
				var body = ed.getBody(), cm = ed.controlManager, disabled = true;

				if(ed.dom.hasClass(body,'CT-hide')) {
					//activate show changes button
                    ed.plugins.ice.showChangesButton.setActive(true);
					ed.dom.removeClass(body, 'CT-hide');
					disabled = false;
				} else {
					//deactivate show changes button
                    ed.plugins.ice.showChangesButton.setActive(false);
					ed.dom.addClass(body, 'CT-hide');
				}

				//toggle button disabling
                ed.plugins.ice.acceptAllButton.setDisabled(disabled);
                ed.plugins.ice.rejectAllButton.setDisabled(disabled);
                ed.plugins.ice.acceptButton.setDisabled(disabled);
                ed.plugins.ice.rejectButton.setDisabled(disabled);

				ed.execCommand('mceRepaint');
			});

			/**
			 * Calls the ice smart quotes plugin to convert regular quotes to smart quotes.
			 */
			ed.addCommand('ice_smartquotes', function(quiet) {
				changeEditor.pluginsManager.plugins['IceSmartQuotesPlugin'].convert(ed.getBody());
				if (!quiet) ed.windowManager.alert('Regular quotes have been converted into smart quotes.');
			});
			
			/**
			 * Toggle change tracking on or off. Delegates to ice_enable or ice_disable.
			 */
			ed.addCommand('ice_togglechanges', function() {
				if(changeEditor.isTracking) {
					ed.execCommand('ice_disable');
				} else {
					ed.execCommand('ice_enable');
				}
			});
			
			/**
			 * Turns change tracking on - ice will handle incoming key events.
			 */
			ed.addCommand('ice_enable', function() {
				changeEditor.enableChangeTracking();
				//toggle buttons and call show changes
                ed.plugins.ice.trackChangesButton.setActive(true);
                ed.plugins.ice.showChangesButton.setDisabled(false);
                		ed.execCommand('ice_toggleshowchanges');
				self.isTracking = true;
			});
			
			/**
			 * Turns change tracking off - ice will be present but it won't listen
			 * or act on events.
			 */
			ed.addCommand('ice_disable', function() {
				//hide changes and toggle buttons
				var body = ed.getBody();
				ed.dom.addClass(body, 'CT-hide');
                ed.plugins.ice.trackChangesButton.setActive(false);
                ed.plugins.ice.showChangesButton.setActive(false);
                ed.plugins.ice.showChangesButton.setDisabled(true);
                ed.plugins.ice.acceptAllButton.setDisabled(true);
                ed.plugins.ice.rejectAllButton.setDisabled(true);
                ed.plugins.ice.acceptButton.setDisabled(true);
                ed.plugins.ice.rejectButton.setDisabled(true);
				changeEditor.disableChangeTracking();
				self.isTracking = false;
			});
			
			/**
			 * Returns 1 if ice is handling events and tracking changes; otherwise, 0.
			 */
			ed.addCommand('ice_isTracking', function() {
				return changeEditor.isTracking ? 1 : 0;
			});
			
			/**
			 * Calls the copy-paste ice plugin to strip tags and attributes out of the given `html`.
			 */
			ed.addCommand('ice_strippaste', function(html) {
				return changeEditor.pluginsManager.plugins['IceCopyPastePlugin'].stripPaste(html);
			});
			
			/**
			 * Makes a manual call to the paste handler - this feature is only useful when `isTracking`
			 * is false; otherwise, ice will automatically handle paste events.
			 */
			ed.addCommand('ice_handlepaste', function(html) {
				return changeEditor.pluginsManager.plugins['IceCopyPastePlugin'].handlePaste();
			});
			
			/**
			 * Makes a manual call to the emdash handler - this feature is only useful when `isTracking`
			 * is false and the emdash plugin is not on; otherwise, ice will handle emdash conversion.
			 */
			ed.addCommand('ice_handleemdash', function(html) {
				return changeEditor.pluginsManager.plugins['IceEmdashPlugin'].convertEmdash() ? 1 : 0;
			});
			
            //  _____
            // |_   _|
            //  | |    ___   ___   _ __   ___
            //  | |   / __| / _ \ | '_ \ / __|
            // _| |_ | (__ | (_) || | | |\__ \
            // \___/  \___| \___/ |_| |_||___/

			// Icons are now svg only. Either you make a package https://www.tiny.cloud/docs/advanced/creating-an-icon-pack/
			// or you add icons as below
            ed.ui.registry.addIcon('accept', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M466.27 286.69C475.04 271.84 480 256 480 236.85c0-44.015-37.218-85.58-85.82-85.58H357.7c4.92-12.81 8.85-28.13 8.85-46.54C366.55 31.936 328.86 0 271.28 0c-61.607 0-58.093 94.933-71.76 108.6-22.747 22.747-49.615 66.447-68.76 83.4H32c-17.673 0-32 14.327-32 32v240c0 17.673 14.327 32 32 32h64c14.893 0 27.408-10.174 30.978-23.95 44.509 1.001 75.06 39.94 177.802 39.94 7.22 0 15.22.01 22.22.01 77.117 0 111.986-39.423 112.94-95.33 13.319-18.425 20.299-43.122 17.34-66.99 9.854-18.452 13.664-40.343 8.99-62.99zm-61.75 53.83c12.56 21.13 1.26 49.41-13.94 57.57 7.7 48.78-17.608 65.9-53.12 65.9h-37.82c-71.639 0-118.029-37.82-171.64-37.82V240h10.92c28.36 0 67.98-70.89 94.54-97.46 28.36-28.36 18.91-75.63 37.82-94.54 47.27 0 47.27 32.98 47.27 56.73 0 39.17-28.36 56.72-28.36 94.54h103.99c21.11 0 37.73 18.91 37.82 37.82.09 18.9-12.82 37.81-22.27 37.81 13.489 14.555 16.371 45.236-5.21 65.62zM88 432c0 13.255-10.745 24-24 24s-24-10.745-24-24 10.745-24 24-24 24 10.745 24 24z"/></svg>');
            ed.ui.registry.addIcon('reject', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M466.27 225.31c4.674-22.647.864-44.538-8.99-62.99 2.958-23.868-4.021-48.565-17.34-66.99C438.986 39.423 404.117 0 327 0c-7 0-15 .01-22.22.01C201.195.01 168.997 40 128 40h-10.845c-5.64-4.975-13.042-8-21.155-8H32C14.327 32 0 46.327 0 64v240c0 17.673 14.327 32 32 32h64c11.842 0 22.175-6.438 27.708-16h7.052c19.146 16.953 46.013 60.653 68.76 83.4 13.667 13.667 10.153 108.6 71.76 108.6 57.58 0 95.27-31.936 95.27-104.73 0-18.41-3.93-33.73-8.85-46.54h36.48c48.602 0 85.82-41.565 85.82-85.58 0-19.15-4.96-34.99-13.73-49.84zM64 296c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm330.18 16.73H290.19c0 37.82 28.36 55.37 28.36 94.54 0 23.75 0 56.73-47.27 56.73-18.91-18.91-9.46-66.18-37.82-94.54C206.9 342.89 167.28 272 138.92 272H128V85.83c53.611 0 100.001-37.82 171.64-37.82h37.82c35.512 0 60.82 17.12 53.12 65.9 15.2 8.16 26.5 36.44 13.94 57.57 21.581 20.384 18.699 51.065 5.21 65.62 9.45 0 22.36 18.91 22.27 37.81-.09 18.91-16.71 37.82-37.82 37.82z"/></svg>');
            ed.ui.registry.addIcon('accept_all', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M466.27 286.69C475.04 271.84 480 256 480 236.85c0-44.015-37.218-85.58-85.82-85.58H357.7c4.92-12.81 8.85-28.13 8.85-46.54C366.55 31.936 328.86 0 271.28 0c-61.607 0-58.093 94.933-71.76 108.6-22.747 22.747-49.615 66.447-68.76 83.4H32c-17.673 0-32 14.327-32 32v240c0 17.673 14.327 32 32 32h64c14.893 0 27.408-10.174 30.978-23.95 44.509 1.001 75.06 39.94 177.802 39.94 7.22 0 15.22.01 22.22.01 77.117 0 111.986-39.423 112.94-95.33 13.319-18.425 20.299-43.122 17.34-66.99 9.854-18.452 13.664-40.343 8.99-62.99zm-61.75 53.83c12.56 21.13 1.26 49.41-13.94 57.57 7.7 48.78-17.608 65.9-53.12 65.9h-37.82c-71.639 0-118.029-37.82-171.64-37.82V240h10.92c28.36 0 67.98-70.89 94.54-97.46 28.36-28.36 18.91-75.63 37.82-94.54 47.27 0 47.27 32.98 47.27 56.73 0 39.17-28.36 56.72-28.36 94.54h103.99c21.11 0 37.73 18.91 37.82 37.82.09 18.9-12.82 37.81-22.27 37.81 13.489 14.555 16.371 45.236-5.21 65.62zM88 432c0 13.255-10.745 24-24 24s-24-10.745-24-24 10.745-24 24-24 24 10.745 24 24z"/></svg>');
            ed.ui.registry.addIcon('reject_all', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M466.27 225.31c4.674-22.647.864-44.538-8.99-62.99 2.958-23.868-4.021-48.565-17.34-66.99C438.986 39.423 404.117 0 327 0c-7 0-15 .01-22.22.01C201.195.01 168.997 40 128 40h-10.845c-5.64-4.975-13.042-8-21.155-8H32C14.327 32 0 46.327 0 64v240c0 17.673 14.327 32 32 32h64c11.842 0 22.175-6.438 27.708-16h7.052c19.146 16.953 46.013 60.653 68.76 83.4 13.667 13.667 10.153 108.6 71.76 108.6 57.58 0 95.27-31.936 95.27-104.73 0-18.41-3.93-33.73-8.85-46.54h36.48c48.602 0 85.82-41.565 85.82-85.58 0-19.15-4.96-34.99-13.73-49.84zM64 296c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm330.18 16.73H290.19c0 37.82 28.36 55.37 28.36 94.54 0 23.75 0 56.73-47.27 56.73-18.91-18.91-9.46-66.18-37.82-94.54C206.9 342.89 167.28 272 138.92 272H128V85.83c53.611 0 100.001-37.82 171.64-37.82h37.82c35.512 0 60.82 17.12 53.12 65.9 15.2 8.16 26.5 36.44 13.94 57.57 21.581 20.384 18.699 51.065 5.21 65.62 9.45 0 22.36 18.91 22.27 37.81-.09 18.91-16.71 37.82-37.82 37.82z"/></svg>');
            ed.ui.registry.addIcon('tracker', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M528 336c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 112c-13.23 0-24-10.77-24-24s10.77-24 24-24 24 10.77 24 24-10.77 24-24 24zm80-288h-64v-40.2c0-14.12 4.7-27.76 13.15-38.84 4.42-5.8 3.55-14.06-1.32-19.49L534.2 37.3c-6.66-7.45-18.32-6.92-24.7.78C490.58 60.9 480 89.81 480 119.8V160H377.67L321.58 29.14A47.914 47.914 0 0 0 277.45 0H144c-26.47 0-48 21.53-48 48v146.52c-8.63-6.73-20.96-6.46-28.89 1.47L36 227.1c-8.59 8.59-8.59 22.52 0 31.11l5.06 5.06c-4.99 9.26-8.96 18.82-11.91 28.72H22c-12.15 0-22 9.85-22 22v44c0 12.15 9.85 22 22 22h7.14c2.96 9.91 6.92 19.46 11.91 28.73l-5.06 5.06c-8.59 8.59-8.59 22.52 0 31.11L67.1 476c8.59 8.59 22.52 8.59 31.11 0l5.06-5.06c9.26 4.99 18.82 8.96 28.72 11.91V490c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-7.14c9.9-2.95 19.46-6.92 28.72-11.91l5.06 5.06c8.59 8.59 22.52 8.59 31.11 0l31.11-31.11c8.59-8.59 8.59-22.52 0-31.11l-5.06-5.06c4.99-9.26 8.96-18.82 11.91-28.72H330c12.15 0 22-9.85 22-22v-6h80.54c21.91-28.99 56.32-48 95.46-48 18.64 0 36.07 4.61 51.8 12.2l50.82-50.82c6-6 9.37-14.14 9.37-22.63V192c.01-17.67-14.32-32-31.99-32zM176 416c-44.18 0-80-35.82-80-80s35.82-80 80-80 80 35.82 80 80-35.82 80-80 80zm22-256h-38V64h106.89l41.15 96H198z"/></svg>');
            ed.ui.registry.addIcon('show_track_changes', '<svg height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"/></svg>');

            //  ______         _    _
            // | ___ \       | |  | |
            // | |_/ / _   _ | |_ | |_   ___   _ __   ___
            // | ___ \| | | || __|| __| / _ \ | '_ \ / __|
            // | |_/ /| |_| || |_ | |_ | (_) || | | |\__ \
            // \____/  \__,_| \__| \__| \___/ |_| |_||___/

            ed.ui.registry.addToggleButton('iceaccept', {
                tooltip: 'Accept Change',
                icon: 'accept',
                onAction: (_) => ed.execCommand('iceaccept'),
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.acceptButton = self;
                        ed.plugins.ice.acceptButton.disabled = self.disabled;                };
                    ed.on('init', editorEventCallback);
		                    ed.on('NodeChange', function (e) {
		                        if (isInsideChangeTag(e.element)) {
                            self.setDisabled(false);
		                        } else {
                            self.setDisabled(true);
		                        }
		                    });
                    return (buttonApi) => editor.off('init', editorEventCallback);
                }
			});

            ed.ui.registry.addToggleButton('icereject', {
                tooltip: 'Reject Change',
                icon: 'reject',
                onAction: (_) => ed.execCommand('icereject'),
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.rejectButton = self;
                        ed.plugins.ice.rejectButton.disabled = self.disabled;                    };
                    ed.on('init', editorEventCallback);
		                    ed.on('NodeChange', function (e) {
		                        if (isInsideChangeTag(e.element)) {
                            self.setDisabled(false);
		                        } else {
                            self.setDisabled(true);
		                        }
		                    });
                    return (buttonApi) => editor.off('init', editorEventCallback);
		                }
			});
	
            ed.ui.registry.addButton('iceacceptall', {
                tooltip: 'Accept All Changes',
                icon: 'accept_all',
                onAction: (_) => ed.execCommand('iceacceptall'),
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.acceptAllButton = self;
		                    ed.plugins.ice.acceptAllButton.disabled = self.disabled;
                    };
                    ed.on('init', editorEventCallback);
                    return (buttonApi) => editor.off('init', editorEventCallback);
		                }
			});

            ed.ui.registry.addButton('icerejectall', {
                tooltip: 'Reject All Changes',
                icon: 'reject_all',
                onAction: (_) => ed.execCommand('icerejectall'),
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.rejectAllButton = self;
		                    ed.plugins.ice.rejectAllButton.disabled = self.disabled;
                    };
                    ed.on('init', editorEventCallback);
                    return (buttonApi) => editor.off('init', editorEventCallback);
		                }
			});
			
            ed.ui.registry.addToggleButton('ice_toggleshowchanges', {
                tooltip: 'Show/Hide Track Changes',
                icon: 'show_track_changes',
                onAction: (_) => {
		                    ed.fire('ice_toggleshowchanges');
		                    ed.execCommand('ice_toggleshowchanges');
		                },
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.showChangesButton = self;
		                    ed.plugins.ice.showChangesButton.disabled = self.disabled;
		                    ed.plugins.ice.showChangesButton.active = self.active;
                    };
                    ed.on('init', editorEventCallback);
                    return (buttonApi) => editor.off('init', editorEventCallback);
		                }
			});
			
            ed.ui.registry.addToggleButton('ice_smartquotes', {
                icon: 'rejectAll',
                tooltip: 'Convert quotes to smart quotes',
                onAction: (_) => ed.execCommand('ice_smartquotes')
			});
			
            ed.ui.registry.addToggleButton('ice_togglechanges', {
                tooltip: 'Turn On Track Changes ',
                icon: 'tracker',
                onAction: (_) => {
                    ed.execCommand('ice_togglechanges');
                },
                onSetup: (buttonApi) => {
                    var self = buttonApi;
                    const editorEventCallback = (eventApi) => {
		                    ed.plugins.ice.trackChangesButton = self;
		                    ed.plugins.ice.trackChangesButton.disabled = self.disabled;
		                    ed.plugins.ice.trackChangesButton.active = self.active;
                    };
                    ed.on('init', editorEventCallback);
                    return (buttonApi) => editor.off('init', editorEventCallback);
		                }
			});
			

            // ___  ___                      _____  _
            // |  \/  |                     |_   _|| |
            // | .  . |  ___  _ __   _   _    | |  | |_   ___  _ __ ___
            // | |\/| | / _ \| '_ \ | | | |   | |  | __| / _ \| '_ ` _ \
            // | |  | ||  __/| | | || |_| |  _| |_ | |_ |  __/| | | | | |
            // \_|  |_/ \___||_| |_| \__,_|  \___/  \__| \___||_| |_| |_|

			ed.ui.registry.addNestedMenuItem('nesteditem', {
				text: 'ICE action',
				getSubmenuItems: () => {
					return [{
						type: 'menuitem',
						icon: 'accept',
						text: 'Accept Change',
						onAction: (_) =>  ed.execCommand('iceaccept'),
					}, {
						type: 'menuitem',
						icon: 'reject',
						text: 'Reject Change',
						onAction: (_) =>  ed.execCommand('icereject'),
					}];
				}
			});

			
			/**
			 * Node Change event - watch for node changes and toggle buttons.
			 */
			ed.on('NodeChange',function(e) {
				cleanup();
			});
			
			/**
			 * Private Methods
			 */

			function isInsideChangeTag(n) {
				return !!ed.dom.getParent(n, self.insertSelector + ',' + self.deleteSelector);
			}

			function cleanup() {
				var empty = ed.dom.select(self.insertSelector + ':empty,' + self.deleteSelector + ':empty');
				ed.dom.remove(empty);
				// Browsers insert breaks into empty paragraphs as a space holder - clean that up
				// Not playing nice with Webkit...
				/*tinymce.each(ed.dom.select('br'), function(br, i) {
					var p = ed.dom.getParent(br, 'p');
					if(p && (p.innerText || p.textContent) !== '')
						ed.dom.remove(br);
				});*/
			}

		}
	});

	tinymce.PluginManager.add('ice', tinymce.plugins.IcePlugin);
})();
