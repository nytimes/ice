(function() {

	tinymce.PluginManager.load('icelib', tinymce.PluginManager.urls.ice + '/ice/ice.min.js', function(){
		 // onload callback? May happen before MCE is fully loaded
	});

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
		afterInit: function() {},
		afterClean: function(body) { return body; },
		beforePasteClean: function(body) { return body; },
		afterPasteClean: function(body) { return body; },

		/**
		 * Plugin initialization - register buttons, commands, and take care of setup.
		 */
		init: function(ed, url) {
			var self = this, changeEditor = {};

			/*
			To add MCE custom event handlers:
			ed.iceAfterLoad.add( function(){ //callback }, (optional scope) );

			Can also use:
			ed.afterInit.addToTop() to add with higher event priority
			ed.afterInit.remove(func_ref) to remove observer function (named functions only)
			*/

			ed.iceAfterInit = new tinymce.util.Dispatcher(self);
			ed.iceAfterClean = new tinymce.util.Dispatcher(self);
		//	ed.iceAfterPasteClean = new tinymce.util.Dispatcher(self); // no way to convert to event?

			ed.iceAccept = new tinymce.util.Dispatcher(self);
			ed.iceReject = new tinymce.util.Dispatcher(self);
			ed.iceAcceptAll = new tinymce.util.Dispatcher(self);
			ed.iceRejectAll = new tinymce.util.Dispatcher(self);

			/**
			 * After the editor renders, initialize ice.
			 */
			ed.onInit.add(function(ed) {
				var dom = ed.dom;

				tinymce.extend(self, ed.getParam('ice'));
				self.insertSelector = '.' + self.insertClass;
				self.deleteSelector = '.' + self.deleteClass;

				// Add insert and delete tag/attribute rules.
				// Important: keep `id` and `style` in attributes list in case `insertTag` is a `span` - tinymce uses spans
				// with ids and inline styles.
				ed.serializer.addRules(self.insertTag + '[id|class|style|title|username|userid|cid]');

				if ( self.insertTag != self.deleteTag )
					ed.serializer.addRules(self.deleteTag + '[id|class|style|title|username|userid|cid]');
				// Temporary tags to act as placeholders for deletes.
				ed.serializer.addRules('tempdel[data-allocation]');

				dom.loadCSS(self.css.indexOf('://') > 0 ? self.css : (url + '/' + self.css));

				if ( !self.manualInit )
					ed.execCommand('initializeice');

				// Setting the Show/Hide Changes button to active
				ed.controlManager.setActive('ice_toggleshowchanges', true);
				if(self.isTracking)
					ed.controlManager.setActive('ice_togglechanges', true);
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
					ed.onEvent.add(function(ed, e) {
						return changeEditor.handleEvent(e);
					});
					setTimeout(function() {
						self.afterInit.call(self);
						// MCE custom event
						ed.iceAfterInit.dispatch(self);
					}, 1);
				}, 5);
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
				var body = changeEditor.getCleanContent(el || ed.getContent(), self.afterClean);
				ed.iceAfterClean.dispatch({body: body, scope: self});
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
				var n = node || ed.selection.getNode(), parents = [];
				ed.undoManager.add();

				//changeEditor.acceptChange(node);

				ed.iceAccept.dispatch({node: n, scope: self});

				if ( isInsert(n) ) {
					ed.dom.remove(n, true);
				} else if ( isDelete(n) ) {
					parents.push( n.parentNode );
					ed.dom.remove(n);
				}

				cleanup(parents);
				ed.execCommand('ice_initenv'); // temp until the event is used?
			});

			/**
			 * Uses the given `node` or finds the current node where the selection resides, and in the
			 * case of a delete tag, removes the outer delete tag and keeps the contents in place, or
			 * in the case of an insert, removes the node.
			 */
			ed.addCommand('icereject', function(node) {
				var n = node || ed.selection.getNode(), parents = [];
				ed.undoManager.add();

				//changeEditor.rejectChange(node);
				ed.iceReject.dispatch({node: n, scope: self});

				if ( isInsert(n) ) {
					parents.push( n.parentNode );
					ed.dom.remove(n);
				} else if ( isDelete(n) ) {
					ed.dom.remove(n, true);
				}

				cleanup(parents);
				ed.execCommand('ice_initenv'); // temp until the event is used?
			});

			/**
			 * Cleans the editor body of change tags - removes delete nodes, and removes outer insert
			 * tags keeping the inner content in place. Defers to cleaning technique.
			 */
			ed.addCommand('iceacceptall', function() {
				var inserts = ed.dom.select(self.insertSelector), deletes = ed.dom.select(self.deleteSelector), parents = [];

				ed.undoManager.add();
				//changeEditor.acceptAll();

				tinymce.each(deletes, function(el){
					parents.push( el.parentNode );
				});

				ed.iceAcceptAll.dispatch(self);
				ed.dom.remove(deletes);
				ed.dom.remove(inserts, true);

				cleanup(parents);
				ed.execCommand('ice_initenv'); // temp until the event is used?
			});

			/**
			 * Cleans the editor body of change tags - removes inserts, and removes outer delete tags,
			 * keeping the inner content in place.
			 */
			ed.addCommand('icerejectall', function() {
				var inserts = ed.dom.select(self.insertSelector), deletes = ed.dom.select(self.deleteSelector), parents = [];

				ed.undoManager.add();
				//changeEditor.rejectAll();

				tinymce.each(inserts, function(el){
					parents.push( el.parentNode );
				});

				ed.iceRejectAll.dispatch(self);
				ed.dom.remove(deletes, true);
				ed.dom.remove(inserts);

				cleanup(parents);
				ed.execCommand('ice_initenv'); // temp until the event is used?
			});

			/**
			 * Adds a class to the editor body which will toggle, hide or show, track change styling.
			 */
			ed.addCommand('ice_toggleshowchanges', function() {
				var body = ed.getBody(), cm = ed.controlManager, disabled = false;

				if(ed.dom.hasClass(body,'CT-hide')) {
					cm.setActive('ice_toggleshowchanges', true);
					ed.dom.removeClass(body, 'CT-hide');
				} else {
					cm.setActive('ice_toggleshowchanges', false);
					ed.dom.addClass(body, 'CT-hide');
					disabled = true;
				}

				tinymce.each(['iceacceptall','icerejectall'], function(button){
					cm.setDisabled(button, disabled);
				});

				ed.execCommand('mceRepaint');
			});

			/**
			 * Calls the ice smart quotes plugin to convert regular quotes to smart quotes.
			 */
			ed.addCommand('ice_smartquotes', function() {
				var body = ed.getBody();
				changeEditor.pluginsManager.plugins['IceSmartQuotesPlugin'].convert(body);
				ed.windowManager.alert('Regular quotes have been converted into smart quotes.');
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
				ed.controlManager.setActive('ice_togglechanges', true);
				self.isTracking = true;
			});

			/**
			 * Turns change tracking off - ice will be present but it won't listen
			 * or act on events.
			 */
			ed.addCommand('ice_disable', function() {
				changeEditor.disableChangeTracking();
				ed.controlManager.setActive('ice_togglechanges', false);
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
			 * Register Buttons
			 */
			ed.addButton('iceaccept', {
				title : 'Accept Change',
				image : url + '/img/ice-accept-change.png',
				cmd : 'iceaccept'
			});

			ed.addButton('icereject', {
				title : 'Reject Change',
				image : url + '/img/ice-reject-change.png',
				cmd : 'icereject'
			});

			ed.addButton('iceacceptall', {
				title : 'Accept All Changes',
				image : url + '/img/ice-accept.png',
				cmd : 'iceacceptall'
			});

			ed.addButton('icerejectall', {
				title : 'Reject All Changes',
				image : url + '/img/ice-reject.png',
				cmd : 'icerejectall'
			});

			ed.addButton('ice_toggleshowchanges', {
				title : 'Show Track Changes',
				image : url + '/img/ice-showchanges.png',
				cmd : 'ice_toggleshowchanges'
			});

			ed.addButton('ice_smartquotes', {
				title : 'Convert quotes to smart quotes',
				'class' : 'mce_blockquote',
				cmd : 'ice_smartquotes'
			});

			ed.addButton('ice_togglechanges', {
				title : 'Turn On Track Changes ',
				image : url + '/img/ice-togglechanges.png',
				cmd : 'ice_togglechanges'
			});

			if(ed.plugins.contextmenu) {
				ed.plugins.contextmenu.onContextMenu.add(function(th, menu, node) {
					if(isInsideChangeTag(node)) {
						menu.add({
							title: "<img src='"+url+"/img/ice-accept-change.png' style='vertical-align: middle;margin-left: -22px;margin-right: 5px;'>Accept Change",
							icon: '',
							cmd: 'iceaccept'
						});
						menu.add({
							title: "<img src='"+url+"/img/ice-reject-change.png' style='vertical-align: middle;margin-left: -22px;margin-right: 5px;'>Reject Change",
							icon: '',
							cmd: 'icereject'
						});
					}
				});
			}

			/**
			 * Node Change event - watch for node changes and toggle buttons.
			 */
			ed.onNodeChange.add(function(ed, cm, n) {
				if (isInsideChangeTag(n)) {
					cm.setDisabled('iceaccept', false);
					cm.setDisabled('icereject', false);
					cleanup();
				} else {
					cm.setDisabled('iceaccept', true);
					cm.setDisabled('icereject', true);
				}
			});

			/**
			 * Private Methods
			 */

			function isInsideChangeTag(n) {
				return !!ed.dom.getParent(n, self.insertSelector + ',' + self.deleteSelector);
			}

			function isInsert(n) {
				return ed.dom.is(n, self.insertSelector);
			}

			function isDelete(n) {
				return ed.dom.is(n, self.deleteSelector);
			}

			function cleanup(parents) {
				var empty = ed.dom.select(self.insertSelector + ':empty,' + self.deleteSelector + ':empty');
				parents = parents || [];

				if ( empty && empty[0] ) {
					tinymce.each(empty, function(el){
						parents.push( el.parentNode );
					});
					ed.dom.remove(empty);
				}

				if ( parents && parents[0] ) {
					tinymce.each(parents, function(el){
						if ( ed.dom.is(el, 'p:empty, li:empty, span:empty, div:empty') )
							ed.dom.remove(el);
					});
				}

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
