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
						mergeBlocks: self.mergeBlocks,
						userIdAttribute: self.userIdAttribute,
						userNameAttribute: self.userNameAttribute,
						timeAttribute: self.timeAttribute,
						styleColorsNumber: self.styleColorsNumber,
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
					ed.plugins.ice.showChangesButton.active(true);
					ed.dom.removeClass(body, 'CT-hide');
					disabled = false;
				} else {
					//deactivate show changes button
					ed.plugins.ice.showChangesButton.active(false);
					ed.dom.addClass(body, 'CT-hide');
				}

				//toggle button disabling
				ed.plugins.ice.acceptAllButton.disabled(disabled);
                		ed.plugins.ice.rejectAllButton.disabled(disabled);
                		ed.plugins.ice.acceptButton.disabled(disabled);
                		ed.plugins.ice.rejectButton.disabled(disabled);

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
				ed.plugins.ice.trackChangesButton.active(true);
                		ed.plugins.ice.showChangesButton.disabled(false);
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
                		ed.plugins.ice.trackChangesButton.active(false);
        			ed.plugins.ice.showChangesButton.active(false);
                		ed.plugins.ice.showChangesButton.disabled(true);
                		ed.plugins.ice.acceptAllButton.disabled(true);
                		ed.plugins.ice.rejectAllButton.disabled(true);
                		ed.plugins.ice.acceptButton.disabled(true);
                		ed.plugins.ice.rejectButton.disabled(true);
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
			
			/**
			 * Register Buttons
			 */
			ed.addButton('iceaccept', {
				title : 'Accept Change',
				image : url + '/img/accept.gif',
				cmd : 'iceaccept',
		                onPostRender: function () { //assigns button and changes disabled status on node change 
		                    var self = this;
		                    ed.plugins.ice.acceptButton = self;
		                    ed.plugins.ice.acceptButton.disabled = self.disabled;
		
		                    ed.on('NodeChange', function (e) {
		                        if (isInsideChangeTag(e.element)) {
		                            self.disabled(false);
		                        } else {
		                            self.disabled(true);
		                        }
		                    });
                }
			});

			ed.addButton('icereject', {
				title : 'Reject Change',
				image : url + '/img/reject.gif',
				cmd : 'icereject',
		                onPostRender: function () {//assigns button and changes disabled status on node change 
		                    var self = this;
		                    ed.plugins.ice.rejectButton = self;
		                    ed.plugins.ice.rejectButton.disabled = self.disabled;
		
		                    ed.on('NodeChange', function (e) {
		                        if (isInsideChangeTag(e.element)) {
		                            self.disabled(false);
		                        } else {
		                            self.disabled(true);
		                        }
		                    });
		                }
			});
	
			ed.addButton('iceacceptall', {
				title : 'Accept All Changes',
				image : url + '/img/ice-accept.png',
				cmd : 'iceacceptall',
		                onPostRender: function () { //assigns button
		                    var self = this;
		                    ed.plugins.ice.acceptAllButton = self;
		                    ed.plugins.ice.acceptAllButton.disabled = self.disabled;
		                }
			});

			ed.addButton('icerejectall', {
				title : 'Reject All Changes',
				image : url + '/img/ice-reject.png',
				cmd : 'icerejectall',
		                onPostRender: function () { //assigns button
		                    var self = this;
		                    ed.plugins.ice.rejectAllButton = self;
		                    ed.plugins.ice.rejectAllButton.disabled = self.disabled;
		                }
			});
			
			ed.addButton('ice_toggleshowchanges', {
				title : 'Show/Hide Track Changes',
				image : url + '/img/ice-showchanges.png',
		                onclick: function () {
		                    ed.fire('ice_toggleshowchanges');
		                    ed.execCommand('ice_toggleshowchanges');
		                },
		                onPostRender: function () { //assigns button
		                    var self = this;
		                    ed.plugins.ice.showChangesButton = self;
		                    ed.plugins.ice.showChangesButton.disabled = self.disabled;
		                    ed.plugins.ice.showChangesButton.active = self.active;
		                }
			});
			
			ed.addButton('ice_smartquotes', {
				title : 'Convert quotes to smart quotes',
				'class' : 'mce_blockquote',
				cmd : 'ice_smartquotes'
			});
			
			ed.addButton('ice_togglechanges', {
				title : 'Turn On Track Changes ',
				image : url + '/img/ice-togglechanges.png',
				cmd : 'ice_togglechanges',
		                onPostRender: function () { //assigns button
		                    var self = this;
		                    ed.plugins.ice.trackChangesButton = self;
		                    ed.plugins.ice.trackChangesButton.disabled = self.disabled;
		                    ed.plugins.ice.trackChangesButton.active = self.active;
		                }
			});
			
			ed.addMenuItem('iceaccept', {
	                	icon: 'accept',
	                	text: 'Accept Change',
	                	onclick: function () {
	                	    ed.execCommand('iceaccept');
	                	},
	                	context: 'tools',
	                	prependToContext: true
	            	});
	            	
	            	ed.addMenuItem('icereject', {
                		icon: 'reject',
                		text: 'Reject Change',
                		onclick: function () {
                    		ed.execCommand('icereject');
                		},
                		context: 'tools',
                		prependToContext: true
            		});
			
			if(ed.plugins.contextmenu) {
				ed.plugins.contextmenu.onContextMenu.add(function(th, menu, node) {
					if(isInsideChangeTag(node)) {
						menu.add({
							title: "Accept Change", 
							icon: 'accept', 
							cmd: 'iceaccept'
						});
						menu.add({
							title: "Reject Change", 
							icon: 'reject', 
							cmd: 'icereject'
						});
					}
				});
			}
			
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
