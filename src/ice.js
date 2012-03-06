(function() {

var exports = this, defaults, InlineChangeEditor;

defaults = {
	// ice node attribute names:
	changeIdAttribute: 'data-cid',
	userIdAttribute: 'data-userid',
	userNameAttribute: 'data-username',
	timeAttribute: 'data-time',
	// Prepended to `changeType.alias` for classname uniqueness, if needed
	attrValuePrefix: '',
	// Block element tagname, which wrap text and other inline nodes in `this.element`
	blockEl: 'p',
	// Unique style prefix, prepended to a digit, incremented for each encountered user, and stored
	// in ice node class attributes - cts1, cts2, cts3, ...
	stylePrefix: 'cts',
	currentUser: {id: null, name: null},
	// Default change types are insert and delete. Plugins or outside apps should extend this
	// if they want to manage new change types. The changeType name is used as a primary
	// reference for ice nodes; the `alias`, is dropped in the class attribute and is the
	// primary method of identifying ice nodes; and `tag` is used for construction only. 
	// Invoking `this.getCleanContent()` will remove all delete type nodes and remove the tags
	// for the other types, leaving the html content in place.
	changeTypes: {
		insertType: {tag: 'insert', alias: 'ins', action: 'Inserted'},
		deleteType: {tag: 'delete', alias: 'del', action: 'Deleted'}
	},
	// If `true`, setup event listeners on `this.element` and handle events - good option for a basic
	// setup without a text editor. Otherwise, when set to `false`, events need to be manually passed 
	// to `handleEvent`, which is good for a text editor with an event callback handler, like tinymce.
	handleEvents: false,
	// Sets this.element with the contentEditable element
	contentEditable: true,
	// Switch for toggling track changes on/off - when `false` events will be ignored.
	isTracking: true,
	// NOT IMPLEMENTED - Selector for elements that will not get track changes
	doNotTrack: 'span#test',
	// Selector for elements to avoid - move range before or after - similar handling to deletes 
	avoid: '.ice-avoid'
};

InlineChangeEditor = function(options) {
	options || (options = {});
	if(!options.element) throw Error("`options.element` must be defined for ice construction.");

	ice.dom.extend(true, this, defaults, options);

	this.pluginsManager = new ice.IcePluginManager(this);
	if(options.plugins) this.pluginsManager.usePlugins('ice-init', options.plugins);	
}

InlineChangeEditor.prototype = {

	// Data structure for modelling changes in the element according to the following model:
	//  [changeid] => {`type`, `time`, `userid`, `username`}
	_changes: {},
	// Tracks all of the styles for users according to the following model:
	//  [userId] => styleId; where style is "this.stylePrefix" + "this.uniqueStyleIndex"
	_userStyles: {},
	_styles: {},
	// Incremented for each new user and appended to they style prefix, and dropped in the
	// ice node class attribute.
	_uniqueStyleIndex: 0,
	_browserType: null,
	// One change may create multiple ice nodes, so this keeps track of the current batch id.
	_batchChangeid: null,
	// Incremented for each new change, dropped in the changeIdAttribute.
	_uniqueIDIndex: 1,
	// Temporary bookmark tags for deletes, when delete placeholding is active.
	_delBookmark: 'tempdel',
	isPlaceHoldingDeletes: false,
	
	/**
	 * Turns on change tracking - sets up events, if needed, and initializes the environment,
	 * range, and editor.
	 */
	startTracking: function() {
		this.element.setAttribute('contentEditable', this.contentEditable);

		// If we are handling events setup the delegate to handle various events on `this.element`.
		if(this.handleEvents) {
			var self = this;
			ice.dom.bind(self.element, 'keyup keydown keypress mousedown mouseup', function(e) {
				return self.handleEvent(e);
			});
		}

		this.initializeEnvironment();
		this.initializeEditor();
		this.initializeRange();

		this.pluginsManager.fireEnabled(this.element);
		return this;
	},

	/**
	 * Initializes the `env` object with pointers to key objects of the page.
	 */
	initializeEnvironment: function() {
		this.env || (this.env = {});
		this.env.element = this.element;
		this.env.document = this.element.ownerDocument;
		this.env.window = this.env.document.defaultView || this.env.document.parentWindow || window;
		this.env.frame = this.env.window.frameElement;
		this.env.selection = this.selection = new ice.Selection(this.env);
	 },

	/**
	 * Initializes the internal range object and sets focus to the editing element.
	 */
	initializeRange: function() {
		var range = this.selection.createRange();
		range.setStart(ice.dom.find(this.element, this.blockEl)[0], 0);
		range.collapse(true);
		this.selection.addRange(range);
		if(this.env.frame)
			this.env.frame.contentWindow.focus();
		else
			this.element.focus();
	 },

	/**
	 * Initializes the content in the editor - cleans non-block nodes found between blocks and
	 * initializes the editor with any tracking tags found in the editing element.
	 */
	initializeEditor: function() {
		// Clean the element html body - add an empty block if there is no body, or remove any
		// content between block elements.
		var self = this, body = this.env.document.createElement('div');
		if(this.element.childNodes.length) {
			ice.dom.each(ice.dom.contents(this.element), function(i, node) {
				if(ice.dom.isBlockElement(node))
					body.appendChild(node);
			});
			if(body.innerHTML === '')
				body.appendChild(ice.dom.create('<' + this.blockEl + ' ><br/></' + this.blockEl + '>'));
		} else {
			body.appendChild(ice.dom.create('<' + this.blockEl + ' ><br/></' + this.blockEl + '>'));
		}
		this.element.innerHTML = body.innerHTML;

		// Find and load all of the changes and users/styles, present in the element.
		var ins = this._getIceNodeClass('insertType'), del = this._getIceNodeClass('deleteType');
		ice.dom.each(ice.dom.find(this.element, '.'+ins+','+'.'+del), function(i, el) {
			var styleIndex = 0;
			var ctnType = '';
			var classList = el.className.split(' ');
			for(var i = 0; i < classList.length; i++) {
				var styleReg = new RegExp(self.stylePrefix + '-(\\d+)').exec(classList[i]);
				if(styleReg) styleIndex = styleReg[1];
				var ctnReg = new RegExp('('+ins+'|'+del+')').exec(classList[i]);
				if(ctnReg) ctnType = self._getChangeTypeFromAlias(ctnReg[1]);
			}
			var userid = ice.dom.attr(el, self.userIdAttribute);
			self.setUserStyle(userid, Number(styleIndex));
			var changeid = ice.dom.attr(el, self.changeIdAttribute);
			self._changes[changeid] = {
				type: ctnType,
				userid: userid,
				username: ice.dom.attr(el, self.userNameAttribute),
				time: ice.dom.attr(el, self.timeAttribute)
			};
		});
	},
	 
	/**
	 * Turn on change tracking and event handling.
	 */
	enableChangeTracking: function() {
		this.isTracking = true;
		this.pluginsManager.fireEnabled(this.element);
	},

	/**
	 * Turn off change tracking and event handling.
	 */
	disableChangeTracking: function() {
		this.isTracking = false;
		this.pluginsManager.fireDisabled(this.element);
	},

	/**
	 * Set the user to be tracked. A user object has the following properties:
	 * {`id`, `name`}
	 */
	setCurrentUser: function(user) {
		this.currentUser = user;
	},

	/**
	 * If tracking is on, handles event e when it is one of the following types:
	 * mouseup, mousedown, keypress, keydown, and keyup. Each event type is
	 * propagated to all of the plugins. Prevents default handling if the event
	 * was fully handled.
	 */
	handleEvent: function(e) {
		if(!this.isTracking) return;
		if(e.type == 'mouseup') {
			var self = this;
			setTimeout(function() {
				self.mouseUp(e);
			}, 200);
		} else if(e.type == 'mousedown') {
			return this.mouseDown(e);
		} else if(e.type == 'keypress') {
			var needsToBubble = this.keyPress(e);
			if(!needsToBubble) e.preventDefault();
			return needsToBubble;
		} else if(e.type == 'keydown') {
			var needsToBubble = this.keyDown(e);
			if(!needsToBubble) e.preventDefault();
			return needsToBubble;
		} else if(e.type == 'keyup') {
			this.pluginsManager.fireCaretUpdated();
		}
	},

	/**
	 * Returns a tracking tag for the given `changeType`, with the optional `childNode` appended.
	 */
	createIceNode: function(changeType, childNode) {
		var node = this.env.document.createElement(this.changeTypes[changeType].tag);
		ice.dom.addClass(node, this._getIceNodeClass(changeType));

		node.appendChild(childNode ? childNode : this.env.document.createTextNode(''));
		this.addChange(this.changeTypes[changeType].alias, [node]);
		
		this.pluginsManager.fireNodeCreated(node, {'action': this.changeTypes[changeType].action});
		return node;
	},

	/**
	 * Inserts the given string/node into the given range with tracking tags, collapsing (deleting) 
	 * the range first if needed. If range is undefined, then the range from the Selection object 
	 * is used. If the range is in a parent delete node, then the range is positioned after the delete.
	 */
	insert: function(node, range) {
		if(range) this.selection.addRange(range);
		else range = this.getCurrentRange();
		
		if(typeof node === "string") 
			node = document.createTextNode(node);

		// If we have any nodes selected, then we want to delete them before inserting the new text.
		if (!range.collapsed) {
			this.deleteContents();
			// Update the range
			range = this.getCurrentRange();
			if(range.startContainer === range.endContainer && this.element === range.startContainer) {
				// The whole editable element is selected. Need to remove everything and init its contents.
				ice.dom.empty(this.element);
				var firstSelectable = range.getLastSelectableChild(this.element);
				range.setStartAfter(firstSelectable);
				range.collapse(true);
			}
		}

		// If we are in a non-tracking/void element, move the range to the end/outside.
		this._moveRangeToValidTrackingPos(range);

		var changeid = this.startBatchChange();
		// Send a dummy node to be inserted, if node is undefined
		this._insertNode(node || document.createTextNode('\uFEFF'), range, !node);
		this.pluginsManager.fireNodeInserted(node, range);
		this.endBatchChange(changeid);
		return true;
	},

	/**
	 * This command will drop placeholders in place of delete tags in the element 
	 * body and store references in the `_deletes` array to the original delete nodes.
	 * 
	 * A placeholder tag is of the following structure:
	 *   <tempdel data-allocation="[NUM]" />
	 * Where [NUM] is the referenced allocation in the `_deletes` array where the
	 * original delete node is stored.
	 */
	placeholdDeletes: function() {
		var self = this;
		if(this.isPlaceholdingDeletes) {
			this.revertDeletePlaceholders();
		}
		this.isPlaceholdingDeletes = true;
		this._deletes = [];
		var deleteSelector = '.' + this._getIceNodeClass('deleteType');
		ice.dom.each(ice.dom.find(this.element, deleteSelector), function(i, el) {
			self._deletes.push(ice.dom.cloneNode(el));
			ice.dom.replaceWith(el, '<' + self._delBookmark + ' data-allocation="'+(self._deletes.length-1)+'"/>');
		});
		return true;
	},
			
	/**
	 * Replaces all delete placeholders in the element body with the referenced 
	 * delete nodes in the `_deletes` array.
	 * 
	 * A placeholder tag is of the following structure:
	 *   <tempdel data-allocation="[NUM]" />
	 * Where [NUM] is the referenced allocation in the `_deletes` array where the
	 * original delete node is stored.
	 */
	revertDeletePlaceholders: function() {
		var self = this;
		if(!this.isPlaceholdingDeletes) {
			return false;
		}
		ice.dom.each(this._deletes, function(i, el) {
			ice.dom.find(self.element, self._delBookmark + '[data-allocation=' + i +']').replaceWith(el);
		});
		this.isPlaceholdingDeletes = false;
		return true;
	},
	
	/**
	 * Deletes the contents in the given range or the range from the Selection object. If the range
	 * is not collapsed, then a selection delete is handled; otherwise, it deletes one character 
	 * to the left or right if the right parameter is false or true, respectively.
	 *
	 * @return true if deletion was handled.
	 */
	deleteContents: function(right, range) {
		var prevent = true;
		if(range) {
			this.selection.addRange(range);
		} else {
			range = this.getCurrentRange();
		}
		var changeid = this.startBatchChange(this.changeTypes['deleteType'].alias);
		if (range.collapsed === false) {
			this._deleteFromSelection(range);
		} else {
			if(right)
				prevent = this._deleteFromRight(range);
			else 
				prevent = this._deleteFromLeft(range);
		}
		this.selection.addRange(range);
		this.endBatchChange(changeid);
		return prevent;
	},

	/**
	 * Returns the changes - a hash of objects with the following properties:
	 * [changeid] => {`type`, `time`, `userid`, `username`}
	 */
	getChanges: function() {
		return this._changes;
	},

	/**
	 * Returns the html contents for the tracked element.
	 */
	getElementContent: function() {
		return this.element.innerHTML;
	},

	/**
	 * Returns the html contents, without tracking tags, for `this.element` or
	 * the optional `body` param which can be of either type string or node.
	 * Delete tags, and their html content, are completely removed; all other 
	 * change type tags are removed, leaving the html content in place. After 
	 * cleaning, the optional `callback` is executed, which should further 
	 * modify and return the element body.
	 */	
	getCleanContent: function(body, callback) {
		var classList = '';
		var self = this;
		ice.dom.each(this.changeTypes, function(type, i) {
			if(type != 'deleteType') {
				if(i > 0) classList += ',';
				classList += '.' + self._getIceNodeClass(type);
			}
		});
		if(body) {
			if(typeof body === 'string')
				body = ice.dom.create('<div>' + body + '</div>');
			else
				body = ice.dom.cloneNode(body)[0];
		} else {
			body = ice.dom.cloneNode(this.element)[0];
		}
		var changes = ice.dom.find(body, classList);
		ice.dom.each(changes, function(el, i) {
			ice.dom.replaceWith(this, ice.dom.contents(this));
		});
		var deletes = ice.dom.find(body, '.' + this._getIceNodeClass('deleteType'));
		ice.dom.remove(deletes);
		
		body = callback ? callback.call(this, body) : body;

		return body.innerHTML;
	},

	/**
	 * Accepts all changes in the element body - removes delete nodes, and removes outer 
	 * insert tags keeping the inner content in place.
	 */
	acceptAll: function() {
		this.element.innerHTML = this.getCleanContent();
	},
	
	/**
	 * Rejects all changes in the element body - removes insert nodes, and removes outer 
	 * delete tags keeping the inner content in place.*
	 */
	rejectAll: function() {
		var insSel = '.' + this._getIceNodeClass('insertType');
		var delSel = '.' + this._getIceNodeClass('deleteType');

		ice.dom.remove(ice.dom.find(this.element, insSel));
		ice.dom.each(ice.dom.find(this.element, delSel), function(i, el) {
			ice.dom.replaceWith(el, ice.dom.contents(el));
		});
	},
	
	/**
	 * Accepts the change at the given, or first tracking parent node of, `node`.  If
	 * `node` is undefined then the startContainer of the current collapsed range will be used.
	 * In the case of insert, inner content will be used to replace the containing tag; and in 
	 * the case of delete, the node will be removed.
	 */
	acceptChange: function(node) {
		this.acceptRejectChange(node, true);
	},
	
	/**
	 * Rejects the change at the given, or first tracking parent node of, `node`.  If
	 * `node` is undefined then the startContainer of the current collapsed range will be used.
	 * In the case of delete, inner content will be used to replace the containing tag; and in 
	 * the case of insert, the node will be removed.
	 */
	rejectChange: function(node) {
		this.acceptRejectChange(node, false);
	},

	/**
	 * Handles accepting or rejecting tracking changes
	 */
	acceptRejectChange: function(node, isAccept) {
		var delSel, insSel, selector, removeSel, replaceSel, trackNode, changes, dom = ice.dom;

		if(!node) {
			var range = this.getCurrentRange();
			if(!range.collapsed) return;
			else node = range.startContainer;
		}
		
		delSel = removeSel = '.' + this._getIceNodeClass('deleteType');
		insSel = replaceSel = '.' + this._getIceNodeClass('insertType');
		selector = delSel + ',' + insSel; 
		trackNode = dom.getNode(node, selector);
		// Some changes are done in batches so there may be other tracking
		// nodes with the same `changeIdAttribute` batch number.
		changes = dom.find(this.element, '[' + this.changeIdAttribute + '=' + dom.attr(trackNode, this.changeIdAttribute) + ']');
		
		if(!isAccept) {
			removeSel = insSel;
			replaceSel = delSel;
		}

		if(ice.dom.is(trackNode, replaceSel)) {
			dom.each(changes, function(i, node) {
				dom.replaceWith(node, ice.dom.contents(node));
			});
		} else if(dom.is(trackNode, removeSel)) {
			dom.remove(changes);
		}
	},
	
	/**
	 * Returns true if the given `node`, or the current collapsed range is in a tracking 
	 * node; otherwise, false.
	 */
	isInsideChange: function(node) {
		var selector = '.' + this._getIceNodeClass('insertType') + ', .' + this._getIceNodeClass('deleteType');
		if(!node) {
			range = this.getCurrentRange();
			if(!range.collapsed) return false;
			else node = range.startContainer;
		}
		return !!ice.dom.getNode(node, selector);
	},
	
	/**
	 * Add a new change tracking typeName with the given tag and alias.
	 */
	addChangeType: function(typeName, tag, alias, action) {
		var changeType = {
			tag: tag,
			alias: alias
		};
		
		if (action) changeType.action = action;
		
		this.changeTypes[typeName] = changeType;
	},

	/**
	 * Returns this `node` or the first parent tracking node with the given `changeType`.
	 */
	getIceNode: function(node, changeType) {
		var selector = '.' + this._getIceNodeClass(changeType);
		return ice.dom.getNode(node, selector);
	},

	/**
	 * Sets the given `range` to the first position, to the right, where it is outside of 
	 * void elements.
	 */
	_moveRangeToValidTrackingPos: function(range) {
		var onEdge = false;
		var voidEl = this._getVoidElement(range.endContainer);
		while(voidEl) {
			// Move end of range to position it inside of any potential adjacent containers
			// E.G.:  test|<em>text</em>  ->  test<em>|text</em>
			try {
				range.moveEnd(ice.dom.CHARACTER_UNIT, 1);
				range.moveEnd(ice.dom.CHARACTER_UNIT, -1);
			} catch(e) {
				// Moving outside of the element and nothing is left on the page
				onEdge = true;
			}
			if(onEdge || ice.dom.onBlockBoundary(range.endContainer, range.startContainer, this.blockEl)) {
				range.setStartAfter(voidEl);
				range.collapse(true);
				break;
			}
			voidEl = this._getVoidElement(range.endContainer);
			if(voidEl) {
				range.setEnd(range.endContainer, 0);
				range.moveEnd(ice.dom.CHARACTER_UNIT, ice.dom.getNodeTextContent(range.endContainer).length);
				range.collapse();
			} else {
				range.setStart(range.endContainer, 0);
				range.collapse(true);
			}
		}
	},

	/**
	 * Returns the given `node` or the first parent node that matches against the list of void elements.
	 */
	_getVoidElement: function(node) {
		var voidSelector = this._getVoidElSelector();
		return ice.dom.is(node, voidSelector) ? node : (ice.dom.parents(node, voidSelector)[0] || null)
	},

	/**
	 * Returns a combined selector for delete and void elements.
	 */
	_getVoidElSelector: function() {
		return '.' + this._getIceNodeClass('deleteType') + ',' + this.avoid; 
	},
  
	/**
	 * Returns true if node has a user id attribute that matches the current user id.
	 */
	_currentUserIceNode: function(node) {
		return ice.dom.attr(node, this.userIdAttribute) == this.currentUser.id;
	},

	/**
	 * With the given alias, searches the changeTypes objects and returns the
	 * associated key for the alias.
	 */
	_getChangeTypeFromAlias: function(alias) {
		var type, ctnType = null;
		for(type in this.changeTypes) {
			if(this.changeTypes.hasOwnProperty(type)) {
				if(this.changeTypes[type].alias == alias) {
					ctnType =  type;
				}
			}
		}
		
		return ctnType;
	},

	_getIceNodeClass: function(changeType) {
		return this.attrValuePrefix + this.changeTypes[changeType].alias;
	},

	getUserStyle: function(userid) {
		var styleIndex = null;
		if (this._userStyles[userid])
			styleIndex = this._userStyles[userid];
		else
			styleIndex = this.setUserStyle(userid, this.getNewStyleId());
		return styleIndex;
	},

	setUserStyle: function(userid, styleIndex) {
		var style = this.stylePrefix + '-' + styleIndex;
		if(!this._styles[styleIndex]) this._styles[styleIndex] = true;
		return this._userStyles[userid] = style;
	},

	getNewStyleId: function() {
		var id = ++this._uniqueStyleIndex;
		if(this._styles[id]) {
			// Dupe.. create another..
			return this.getNewStyleId();
		} else {
			this._styles[id] = true;
			return id;
		}		
	},

	addChange: function(ctnType, ctNodes) {
		var changeid = this._batchChangeid || this.getNewChangeId();
		if(!this._changes[changeid]) {
			// Create the change object.
			this._changes[changeid] = {
				type: this._getChangeTypeFromAlias(ctnType),
				time: (new Date()).getTime(),
				userid: this.currentUser.id,
				username: this.currentUser.name
			};
		}
		var self = this;
		ice.dom.foreach(ctNodes, function(i) {
			self.addNodeToChange(changeid, ctNodes[i]);
		});

		return changeid;
	},

	/**
	 * Adds tracking attributes from the change with changeid to the ctNode.
	 * @param changeid Id of an existing change.
	 * @param ctNode The element to add for the change.
	 */
	addNodeToChange: function(changeid, ctNode) {
		if (this._batchChangeid !== null)
			changeid = this._batchChangeid;

		var change = this.getChange(changeid);

		if (!ctNode.getAttribute(this.changeIdAttribute))
			ctNode.setAttribute(this.changeIdAttribute, changeid);

		if (!ctNode.getAttribute(this.userIdAttribute))
			ctNode.setAttribute(this.userIdAttribute, change.userid);

		if (!ctNode.getAttribute(this.userNameAttribute))
			ctNode.setAttribute(this.userNameAttribute, change.username);

		if (!ctNode.getAttribute(this.timeAttribute))
			ctNode.setAttribute(this.timeAttribute, change.time);

		if (!ice.dom.hasClass(ctNode, this._getIceNodeClass(change.type)))
			ice.dom.addClass(ctNode, this._getIceNodeClass(change.type));

		var style = this.getUserStyle(change.userid);
		if (!ice.dom.hasClass(ctNode, style))
			ice.dom.addClass(ctNode, style);
	},

	getChange: function(changeid) {
		var change = null;
		if (this._changes[changeid]) {
			change = this._changes[changeid];
		}
		return change;
	},

	getNewChangeId: function() {
		var id = ++this._uniqueIDIndex;
		if(this._changes[id]) {
			// Dupe.. create another..
			id = this.getNewChangeId();
		}
		return id;
	},

	startBatchChange: function() {
		this._batchChangeid = this.getNewChangeId();
		return this._batchChangeid;
	},

	endBatchChange: function(changeid) {
		if(changeid !== this._batchChangeid) return;
		this._batchChangeid = null;
	},

	getCurrentRange: function() {
		return this.selection.getRangeAt(0);
	},

	_insertNode: function(node, range, insertingDummy) {
		var ctNode = this.getIceNode(range.startContainer, 'insertType');
		var inCurrentUserInsert = this._currentUserIceNode(ctNode);
                
		// Do nothing, let this bubble-up to insertion handler.
		if(insertingDummy && inCurrentUserInsert) return;
		// If we aren't in an insert node which belongs to the current user, then create a new ins node
		else if(!inCurrentUserInsert) node = this.createIceNode('insertType', node);

		range.insertNode(node);

		if(insertingDummy) {
			// Create a selection of the dummy character we inserted
			// which will be removed after it bubbles up to the final handler.
			range.setStart(node, 0);
			range.setEnd(node, 1);
		}
		this.selection.addRange(range);
	},

	_deleteFromSelection: function(range) {
		// Bookmark the range and get elements between.
		var bookmark = new ice.Bookmark(this.env, range),
			elements = ice.dom.getElementsBetween(bookmark.start, bookmark.end),
			b1 = ice.dom.parents(range.startContainer, this.blockEl)[0],
			b2 = ice.dom.parents(range.endContainer, this.blockEl)[0],
			betweenBlocks = new Array(),
			eln = elements.length;

		var eln = elements.length;
		for (var i = 0; i < eln; i++) {
			var elem = elements[i];

			if(ice.dom.is(elem, this.blockEl))
				betweenBlocks.push(elem);

			// Ignore empty space
			if(elem.nodeType === ice.dom.TEXT_NODE && ice.dom.getNodeTextContent(elem) === '') continue;

			// If the element is something other than deletes and other non-tracking tags,
			// then delete content.
			if(!this._getVoidElement(elem)) {
				if(elem.nodeType !== ice.dom.TEXT_NODE) {
					// Browsers like to insert breaks into empty paragraphs - remove them
					ice.dom.remove(ice.dom.find(elem, 'br'));
					// Make sure there is more then deleted text content before deleting
					var block = ice.dom.cloneNode(elem);
					ice.dom.remove(ice.dom.find(block, this._getVoidElSelector()));
					if(ice.dom.getNodeTextContent(block).length === 0) {
						continue;
					} else if(ice.dom.is(elem, this.blockEl)) {
						// If we are deleting a block tag then wrap all inner html in a delete. Simplest, but 
						// not the best solution since it will wrap deletes and other void non-tracking nodes.
						var ctNode = this.createIceNode('deleteType');
						newEl = document.createElement(this.blockEl);
						ctNode.innerHTML = elem.innerHTML;
						elem.innerHTML = '';
						elem.appendChild(ctNode);
						continue;
					}
				}
				var del = this.createIceNode('deleteType');
				ice.dom.insertBefore(elem, del);
				del.appendChild(elem);
			}
		}

		if(b1 !== b2) {
			while(betweenBlocks.length)
				ice.dom.mergeContainers(betweenBlocks.shift(), b1);
			ice.dom.mergeContainers(b2, b1);
		}

		var startEl = bookmark.start.previousSibling;
		if (!startEl) {
			startEl = this.env.document.createTextNode('');
			ice.dom.insertBefore(bookmark.start, startEl);
			this.selection.addRange(range);
			bookmark.selectBookmark();
			range = this.getCurrentRange();
			range.setStart(startEl, 0);
		} else {
			bookmark.selectBookmark();
			range = this.getCurrentRange();
			// Move start of range to position it on the inside of any adjacent container, if exists.
			// E.G.:  <em>text</em>|test  ->  <em>text|</em>test
			range.moveStart(ice.dom.CHARACTER_UNIT, -1);
			range.moveStart(ice.dom.CHARACTER_UNIT, 1);
		}

		range.collapse(true);
	},

	_deleteFromRight: function(range) {
	
		var parentBlock = ice.dom.parents(range.startContainer, this.blockEl)[0] 
				|| ice.dom.is(range.startContainer, this.blockEl) && range.startContainer 
				|| null;
		var nextBlock = parentBlock && parentBlock.nextSibling || null;
		var isEmptyBlock = (ice.dom.is(range.startContainer, this.blockEl) 
				&& ice.dom.getNodeTextContent(range.startContainer) == '');
		
		// Move end of range to position it on the inside of any adjacent container that it 
		// is going to potentially delete into.   E.G.:  test|<em>text</em>  ->  test<em>|text</em>
		range.moveEnd(ice.dom.CHARACTER_UNIT, 1);
		range.moveEnd(ice.dom.CHARACTER_UNIT, -1);

		// If the container we are deleting into is outside of our ice element, then we need to stop.
		if(!nextBlock && !ice.dom.isChildOf(range.endContainer, this.element)) {
			range.moveEnd(ice.dom.CHARACTER_UNIT, -1);
			range.moveEnd(ice.dom.CHARACTER_UNIT, 1);
			range.collapse()
			return true;
		}

		// Deleting from beginning of block to end of previous block - merge the blocks
		if(ice.dom.onBlockBoundary(range.endContainer, range.startContainer, this.blockEl) || isEmptyBlock) {
			// Since the range is moved by character, it may have passed through empty blocks.
			// <p>text {RANGE.START}</p><p></p><p>{RANGE.END} text</p>
			if(nextBlock !== ice.dom.parents(range.endContainer, this.blockEl)[0])
				range.setEnd(nextBlock, 0);
			// The browsers like to auto-insert breaks into empty paragraphs - remove them.
			ice.dom.remove(ice.dom.find(range.startContainer, 'br'));
			return ice.dom.mergeBlockWithSibling(range, ice.dom.parents(range.startContainer, this.blockEl)[0] || parentBlock, true);
		}
		
		// If we are deleting into, or in, a non-tracking/void container then move cursor to left of container
		if(this._getVoidElement(range.endContainer)) {
			range.setEnd(range.endContainer, 0)
			range.moveEnd(ice.dom.CHARACTER_UNIT, ice.dom.getNodeTextContent(range.endContainer).length || 0);
			range.collapse();
			return this._deleteFromRight(range);
		}

		range.collapse();

		var container = range.startContainer;

		// Remove content from the right of caret (i.e. delete key).
		// First check if caret is at the end of a container.
		if (range.startContainer.data && range.endOffset === container.data.length) {
			// Check if need to merge containers.
			var cRange = range.cloneRange();
			cRange.moveEnd(ice.dom.CHARACTER_UNIT, 1);
			var eParent = ice.dom.getBlockParent(cRange.endContainer, this.element);
			if (eParent) {
				if (ice.dom.isChildOf(eParent, this.element) === false) {
					return;
				}

				var sParent = ice.dom.getBlockParent(cRange.startContainer, this.element);

				// If the start of the cloned range has moved to a new block
				// parent then merge these nodes.
				if (eParent !== sParent) {
					ice.dom.mergeContainers(eParent, sParent);
					range.setStart(cRange.startContainer, cRange.startContainer.data.length);
					range.collapse(true);
					return;
				}
			}

			// Caret is at the end of a container so it needs to
			// move to the next container.
			var nextContainer = range.getNextContainer(container);

			// If range is at the end of the container and the
			// next container is out side of Ice then do nothing.
			if (ice.dom.isChildOf(nextContainer, this.element) === false) {
				return false;
			}

			var firstSelectable = range.getFirstSelectableChild(nextContainer);
			range.setStart(firstSelectable, 0);

			this._addTextNodeTracking(firstSelectable, range);

		} else {
			var textAddNode = this.getIceNode(range.startContainer, 'insertType');
			// Create a new ct node 
			if (textAddNode === null || !this._currentUserIceNode(textAddNode)) {
				this._addTextNodeTracking(range.startContainer, range, true);
			} else {
				range.moveEnd(ice.dom.CHARACTER_UNIT, 1);
				range.deleteContents();

				// The textAddNode is a tracking node that may be empty now - clean it up.
				if (textAddNode !== null && ice.dom.isBlank(ice.dom.getNodeTextContent(textAddNode)) === true) {
					var prevSibling = textAddNode.previousSibling;
					if (!prevSibling || prevSibling.nodeType !== ice.dom.TEXT_NODE) {
						prevSibling = this.env.document.createTextNode('');
						ice.dom.insertBefore(textAddNode, prevSibling);
					}
					range.setStart(prevSibling, prevSibling.data.length);
					ice.dom.remove(textAddNode);
				}
			}
		}//end if

		// Make sure we leave collapsed
		range.collapse(true);
		return true;
	},

	_deleteFromLeft: function(range) {

		var parentBlock = ice.dom.parents(range.startContainer, this.blockEl)[0]
				|| ice.dom.is(range.startContainer, this.blockEl)
				&& range.startContainer
				|| null,
			prevBlock = parentBlock && parentBlock.previousSibling || null,
			isEmptyBlock = (ice.dom.is(range.startContainer, this.blockEl) && ice.dom.getNodeTextContent(range.startContainer) == '');
		
		// Move range to position the cursor on the inside of any adjacent container that it is going
		// to potentially delete into.  E.G.: <em>text</em>| test  ->  <em>text|</em> test
		range.moveStart(ice.dom.CHARACTER_UNIT, -1);
		var failedToMove = (range.startOffset === range.endOffset && range.startContainer === range.endContainer),
			movedOutsideBlock = !ice.dom.isChildOf(range.startContainer, this.element);
		range.moveStart(ice.dom.CHARACTER_UNIT, 1);

		// If the container we are deleting into is outside of our ice element, then we need to stop.
		if(failedToMove || !prevBlock && movedOutsideBlock) {
			range.moveStart(ice.dom.CHARACTER_UNIT, 1);
			range.moveStart(ice.dom.CHARACTER_UNIT, -1);
			range.collapse(true)
			return true;
		}
	
		// Deleting from beginning of block to end of previous block - merge the blocks
		if(ice.dom.onBlockBoundary(range.startContainer, range.endContainer, this.blockEl) || isEmptyBlock) {
			// Since the range is moved by character, it may have passed through empty blocks.
			// <p>text {RANGE.START}</p><p></p><p>{RANGE.END} text</p>
			if(prevBlock !== ice.dom.parents(range.startContainer, this.blockEl)[0])
				range.setStart(prevBlock, 0);
			// The browsers like to auto-insert breaks into empty paragraphs - remove them.
			ice.dom.remove(ice.dom.find(range.endContainer, 'br'));
			return ice.dom.mergeBlockWithSibling(range, ice.dom.parents(range.endContainer, this.blockEl)[0] || parentBlock);
		}
		
		// If we are deleting into, or in, a void container then move cursor to left of container
		if(this._getVoidElement(range.startContainer)) {
			range.setStart(range.startContainer, 0);
			range.collapse(true);
			return this._deleteFromLeft(range);
		}

		var container = range.startContainer;

		// First check if caret is at the start of a container.
		if (range.startOffset === 0) {
			// Check if need to merge containers.
			var cRange = range.cloneRange();
			cRange.moveStart(ice.dom.CHARACTER_UNIT, -1);

			var sParent = ice.dom.getBlockParent(cRange.startContainer, this.element);
			if (sParent) {
				if (ice.dom.isChildOf(sParent, this.element) === false) {
					return false;
				}

				var eParent = ice.dom.getBlockParent(cRange.endContainer, this.element);

				// If the start of the cloned range has moved to a new block
				// parent then merge these nodes.
				if (eParent !== sParent) {
					ice.dom.mergeContainers(eParent, sParent);

					range.setStart(cRange.startContainer, cRange.startContainer.data.length);
					range.collapse(true);

					// Two block containers merged.
					return;
				}
			}//end if

			// Caret is at the start of a container so it needs to
			// move to the previous container.
			var previousContainer = range.getPreviousContainer(container);

			// If range is at the beginning of the container and the
			// previous container is out side of Ice then do nothing.
			if(!ice.dom.isChildOf(previousContainer, this.element)) {
				return false;
			}

			if (ice.dom.isStubElement(previousContainer)) {
				range.moveStart(ice.dom.CHARACTER_UNIT, -1);
				ice.dom.addClass(previousContainer, this._getIceNodeClass('deleteType'));
				ice.dom.attr(previousContainer, 'title', 'Content removed');
				range.collapse(true);
			} else {
				var lastSelectable = range.getLastSelectableChild(previousContainer);
				range.setStart(lastSelectable, lastSelectable.data.length);
				this._addTextNodeTracking(lastSelectable, range);
			}
		} else {
			var textNode = range.startContainer;
			var textAddNode = this.getIceNode(textNode, 'insertType');

			// Create a new ct node if we aren't already in one by the same user.
			if (textAddNode === null || !this._currentUserIceNode(textAddNode)) {
				this._addTextNodeTracking(textNode, range);
			} else {
				range.moveStart(ice.dom.CHARACTER_UNIT, -1);
				range.moveEnd(ice.dom.CHARACTER_UNIT, -1);
				range.moveEnd(ice.dom.CHARACTER_UNIT, 1);
				range.deleteContents();

				// The textAddNode is a tracking node that may be empty now - clean it up.
				if(textAddNode !== null && ice.dom.isBlank(ice.dom.getNodeTextContent(textAddNode))) {
					var newstart = this.env.document.createTextNode('');
					ice.dom.insertBefore(textAddNode, newstart);
					range.setStart(newstart, 0);
					range.collapse(true);
					ice.dom.replaceWith(textAddNode, ice.dom.contents(textAddNode));
				}
			}
		}
		return true;
	},

	_addTextNodeTracking: function(textNode, range, del) {

		if ((!del && range.startOffset === 0) || this.getIceNode(textNode, 'deleteType') !== null) {
			return;
		}

		var beforeText  = '';
		var removedChar = '';
		var afterText   = '';

		if (!del) {
			beforeText  = textNode.nodeValue.substring(0, (range.startOffset - 1));
			removedChar = textNode.nodeValue.substr((range.startOffset - 1), 1);
			afterText   = textNode.nodeValue.substring(range.startOffset);
		} else {
			beforeText  = textNode.nodeValue.substring(0, range.endOffset);
			removedChar = textNode.nodeValue.substr(range.endOffset, 1);
			afterText   = textNode.nodeValue.substring((range.endOffset + 1));
		}

		if ((range.startOffset === 1 && !del) || (del && range.startOffset === 0)) {
			// Check if we can merge to an existing previous CTNode.
			var ctNode = this.getIceNode(textNode.previousSibling, 'deleteType');

			// Null-out the node so we can create a new node for multi-user nesting/support
			if(ctNode !== null && !this._currentUserIceNode(ctNode))
				ctNode = null;
			
			if (ctNode) {
				// Can add the removed char to previous sibling.
				if (!del) {
					if (ctNode.lastChild && ctNode.lastChild.nodeType === ice.dom.TEXT_NODE) {
						ctNode.lastChild.nodeValue += removedChar;
						range.setStart(ctNode.lastChild, (ctNode.lastChild.nodeValue.length - 1));
					} else {
						var charNode = this.env.document.createTextNode(removedChar);
						ctNode.appendChild(charNode);
						range.setStart(charNode, 0);
					}

					// Update textNode.
					textNode.nodeValue = beforeText + afterText;
					// Update textNode.
					textNode.nodeValue = beforeText + afterText;
					if (textNode.nodeValue.length === 0) {
						// Move the range to the right until there is valid sibling.
						var found	= false;
						var previousSibling = textNode.previousSibling;
						while (!found) {
							ctNode = this.getIceNode(previousSibling, 'deleteType');
							if (!ctNode) {
								found = true;
							} else {
								previousSibling = previousSibling.previousSibling;
							}
						}

						if (previousSibling) {
							previousSibling = range.getLastSelectableChild(previousSibling);
							range.setStart(previousSibling, previousSibling.nodeValue.length);
							range.collapse(true);
						}
					} else {
						range.collapse(true);
					}
				} else {
					if (ctNode.lastChild && ctNode.lastChild.nodeType === ice.dom.TEXT_NODE) {
						ctNode.lastChild.nodeValue += removedChar;
					} else {
						var charNode = this.env.document.createTextNode(removedChar);
						ctNode.appendChild(charNode);
					}

					// Update textNode.
					textNode.nodeValue = beforeText + afterText;
					if (textNode.nodeValue.length === 0) {
						// Move the range to the right until there is valid sibling.
						var found	= false;
						var nextSibling = textNode.nextSibling;
						while (!found) {
							ctNode = this.getIceNode(nextSibling, 'deleteType');
							if (!ctNode) {
								found = true;
							} else {
								nextSibling = nextSibling.nextSibling;
							}
						}

						if (nextSibling) {
							range.setStart(nextSibling, 0);
							range.collapse(true);
						}
					} else {
						range.setStart(textNode, 0);
						range.collapse(true);
					}
				}
				return;
			}
		}

		if (range.startOffset === textNode.nodeValue.length) {
			// Range is at the end of the text node. Check if next sibling
			// is a CTNode that we can join to.
			var ctNode = this.getIceNode(textNode.nextSibling, 'deleteType');

			// Null-out the node so we can create a new node for multi-user nesting/support
			if(ctNode !== null && !this._currentUserIceNode(ctNode))
				ctNode = null;

			if (ctNode) {
				if (ctNode.firstChild && ctNode.firstChild.nodeType === ice.dom.TEXT_NODE) {
					ctNode.firstChild.nodeValue = removedChar + ctNode.firstChild.nodeValue;
				} else {
					var charNode = this.env.document.createTextNode(removedChar);
					ice.dom.insertBefore(ctNode.firstChild, charNode);
				}

				// Update textNode.
				textNode.nodeValue = beforeText;
				range.setStart(textNode, textNode.nodeValue.length);
				range.setEnd(textNode, textNode.nodeValue.length);
				return;
			}
		}

		var ctNode  = this.createIceNode('deleteType');
		var newNode = null;
		if (del !== true) {
			newNode = textNode.splitText(range.startOffset - 1);
			newNode.nodeValue = newNode.nodeValue.substring(1);

			ice.dom.insertAfter(textNode, newNode);
			ctNode.firstChild.nodeValue = removedChar;
			ice.dom.insertAfter(textNode, ctNode);
			range.setStart(textNode, textNode.nodeValue.length);
			range.setEnd(textNode, textNode.nodeValue.length);
		} else {
			newNode = textNode.splitText(range.endOffset);
			newNode.nodeValue = newNode.nodeValue.substring(1);

			ice.dom.insertAfter(textNode, newNode);
			ctNode.firstChild.nodeValue = removedChar;
			ice.dom.insertAfter(textNode, ctNode);
			range.setStart(newNode, 0);
			range.setEnd(newNode, 0);
		}

	},

	/**
	 * Handles arrow, delete key events, and others.
	 *
	 * @param {event} e The event object.
	 * return {void|boolean} Returns false if default event needs to be blocked.
	 */
	_handleAncillaryKey: function(e) {
		var key	= e.keyCode;
		var preventDefault = true;
		var shiftKey = e.shiftKey;

		switch (key) {
			case ice.dom.DOM_VK_DELETE:
				preventDefault = this.deleteContents();
				this.pluginsManager.fireKeyPressed(e);
			break;

			case 46:
				// Key 46 is the DELETE key.
				preventDefault = this.deleteContents(true);
				this.pluginsManager.fireKeyPressed(e);
			break;

			case ice.dom.DOM_VK_DOWN:
			case ice.dom.DOM_VK_UP:
			case ice.dom.DOM_VK_LEFT:
			case ice.dom.DOM_VK_RIGHT:
				this.pluginsManager.fireCaretPositioned();
				preventDefault = false;
			break;

			default:
				// Ignore key.
				preventDefault = false;
			break;
		}//end switch

		if (preventDefault === true) {
			ice.dom.preventDefault(e);
			return false;
		}
		return true;

	},

	keyDown: function(e) {
		if(!this.pluginsManager.fireKeyDown(e)) {
			ice.dom.preventDefault(e);
			return false;
		}
		
		var preventDefault = false;

		if (this._handleSpecialKey(e) === false) {
			if (ice.dom.isBrowser('msie') !== true) {
				this._preventKeyPress = true;
			}

			return false;
		} else if ((e.ctrlKey === true || e.metaKey === true)
			&& (ice.dom.isBrowser('msie') === true || ice.dom.isBrowser('chrome') === true)) {
			// IE does not fire keyPress event if ctrl is also pressed.
			// E.g. CTRL + B (Bold) will not fire keyPress so this.plugins
			// needs to be notified here for IE.
			if (!this.pluginsManager.fireKeyPressed(e)) {
				return false;
			}
		}

		switch (e.keyCode) {
			case 27:
				// ESC
			break;
			default:
				// If not Firefox then check if event is special arrow key etc.
				// Firefox will handle this in keyPress event.
				if (/Firefox/.test(navigator.userAgent) !== true) {
					preventDefault = !(this._handleAncillaryKey(e));
				}
			break;
		}

		if(preventDefault) {
			ice.dom.preventDefault(e);
			return false;
		}

		return true;
	},

	keyPress: function(e) {
		if (this._preventKeyPress === true) {
			this._preventKeyPress = false;
			return;
		}

		if (!this.pluginsManager.fireKeyPressed(e)) return false;

		var c = null;
		if (e.which == null) {
			// IE.
			c = String.fromCharCode(e.keyCode);
		} else if (e.which > 0) {
			c = String.fromCharCode(e.which);
		}

		// Inside a br - most likely in a placeholder of a new block - delete before handling.
		var range = this.getCurrentRange();
		var br = ice.dom.parents(range.startContainer, 'br')[0] || null;
		if(br) {
			range.moveToNextEl(br)
			br.parentNode.removeChild(br);
		}

		// Ice will ignore the keyPress event if CMD or CTRL key is also pressed
		if (c !== null && e.ctrlKey !== true && e.metaKey !== true) {
			switch (e.keyCode) {
				case ice.dom.DOM_VK_DELETE:
					 // Handle delete key for Firefox.
					return this._handleAncillaryKey(e);
				case ice.dom.DOM_VK_ENTER:
					return this._handleEnter();
				default:
					// If we are in a deletion, move the range to the end/outside.
					this._moveRangeToValidTrackingPos(range, range.startContainer);
					return this.insert();
				break;
			}
		}

		return this._handleAncillaryKey(e);
	},

	_handleEnter: function() {
		var range = this.getCurrentRange();
		if(!range.collapsed) this.deleteContents();
		return true;
	},

	_handleSpecialKey: function(e) {
		var keyCode = e.which;
		if (keyCode === null) {
			// IE.
			keyCode = e.keyCode;
		}

		var preventDefault = false;
		switch (keyCode) {
			case 65:
				// Check for CTRL/CMD + A (select all).
				if (e.ctrlKey === true || e.metaKey === true) {
					preventDefault = true;
					var range = this.getCurrentRange();

					if (ice.dom.isBrowser('msie') === true) {
						var selStart = this.env.document.createTextNode('');
						var selEnd = this.env.document.createTextNode('');

						if (this.element.firstChild) {
							ice.dom.insertBefore(this.element.firstChild, selStart);
						} else {
							this.element.appendChild(selStart);
						}

						this.element.appendChild(selEnd);

						range.setStart(selStart, 0);
						range.setEnd(selEnd, 0);
					} else {
						range.setStart(range.getFirstSelectableChild(this.element), 0);
						var lastSelectable = range.getLastSelectableChild(this.element);
						range.setEnd(lastSelectable, lastSelectable.length);
					}//end if

					this.selection.addRange(range);
				}//end if
			break;

			default:
				// Not a special key.
			break;
		}//end switch

		if (preventDefault === true) {
			ice.dom.preventDefault(e);
			return false;
		}

		return true;
	},

	mouseUp: function(e, target) {
		if(!this.pluginsManager.fireClicked(e)) return false;
		this.pluginsManager.fireSelectionChanged(this.getCurrentRange());
	},

	mouseDown: function(e, target) {
		if(!this.pluginsManager.fireMouseDown(e)) return false;
		this.pluginsManager.fireCaretUpdated();
	}
};

exports.ice = this.ice || {};
exports.ice.InlineChangeEditor = InlineChangeEditor;

}).call(this);
