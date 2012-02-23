(function() {

var exports = this, IceCopyPastePlugin;

IceCopyPastePlugin = function(ice_instance) {
	this._ice = ice_instance;
	this._tmpNode = null;
	this._tmpNodeTagName = 'icepaste';
	this._pasteId = 'icepastediv';
	var self = this;
	
	// API

	// 'formatted' - paste will be MS Word cleaned.
	// 'formattedClean' - paste will be MS Word cleaned, insert and 
	//    delete tags will be removed keeping insert content in place,
	//    and tags not found in `preserve` will be stripped.
	this.pasteType = 'formattedClean';

	// Subset of tags that will not be stripped when pasteType
	// is set to 'formattedClean'. Parameter is of type string with
	// comma delimited tag and attribute definitions. For example:
	//   'p,a[href],i[style|title],span[*]'
	// Would allow `p`, `a`, `i` and `span` tags. The attributes for
	// each one of these tags would be cleaned as follows: `p` tags
	// would have all attributes removed, `a` tags will have all but 
	// `href` attributes removed, `i` tags will have all but `style` 
	// and `title` attributes removed, and `span` tags will keep all attributes.
	this.preserve = 'p';

	// Callback triggered before any paste cleaning happens
	this.beforePasteClean = function(body) { return body; };

	// Callback triggered at the end of the paste cleaning
	this.afterPasteClean = function(body) { return body; };

	// Event Listeners
	ice_instance.element.oncopy = function() { return self.handleCopy.apply(self) };
	ice_instance.element.oncut = function() { return self.handleCut.apply(self) };
	// We can't listen for `onpaste` unless we use an algorithm that temporarily switches
	// out the body and lets the browser paste there (found it hard to maintain in mce).
	// Instead, we'll watch the keydown event and handle paste with a typical temp element 
	// algorithm, which means that pasting from the context menu won't work.
}

IceCopyPastePlugin.prototype = {

	setSettings: function(settings) {
		settings = settings || {};
		ice.dom.extend(this, settings);

		//this._ice.changeTypes.cutType = { tag: 'delete', alias: 'del', action: 'Cut'}

		this.preserve += ',' + this._tmpNodeTagName;
		this.setupPreserved();
	},

	keyDown: function(e) {
		if (e.metaKey !== true && e.ctrlKey !== true) {
    		return;
    	}
		
		if(e.keyCode == 86) {
			this.handlePaste();
		}
	},
	
	/**
	 * Saves the current selection in a document fragment, then calls a cut handler
	 * after a brief timeout, giving the browser time to cut.
	 */
	handleCut: function() {
		if(!this._ice.isTracking) return;
		var range = this._ice.getCurrentRange();
		if(range.collapsed) return;
		var html = range.cloneContents();
		var self = this;
		setTimeout(function() {
			self.doCut(html);	
		}, 1);
		return true;
	},

	/**
	 * At this point, the browser has cut the text out. With the given `html` this will
	 * restore the cut content and delete it with track changes tags.
	 */
	doCut: function(html) {
		var range = this._ice.getCurrentRange(), child, last;
		this._tmpNode = this._ice.env.document.createElement('span');
		range.insertNode(this._tmpNode);
		range.setStartAfter(this._tmpNode);
		range.collapse(true);
		while((child = html.firstChild)) {
			range.insertNode(child);
			range.setStartAfter(child);
			range.collapse(true);
			last = child;
		}
		range.setStartBefore(this._tmpNode);
		range.collapse(true);
		range.setEndAfter(last);
		this._ice.env.selection.addRange(range);
		this._ice.deleteContents(null, null, 'cutType');
		ice.dom.remove(this._tmpNode);
	},
	
	handleCopy: function(e) {},

	/**
	 * Inserts a temporary placeholder for the current range and removes
	 * the contents of the ice element body and calls a paste handler.
	 */
	handlePaste: function(e) {
		var range = this._ice.getCurrentRange();

		if(!range.collapsed) {
			if(this._ice.isTracking) {
				this._ice.deleteContents();
				range = range.cloneRange();
			} else {
				range.deleteContents();
				range.collapse(true);
			}
		}

		if(this._ice.isTracking)
			this._ice._moveRangeToValidTrackingPos(range);

		if(range.startContainer == this._ice.element) {
			// Fix a potentially empty body with a bad selection
			var firstBlock = ice.dom.find(this._ice.element, this._ice.blockEl)[0];
			if(!firstBlock) {
				firstBlock = ice.dom.create('<' + this._ice.blockEl + ' ><br/></' + this._ice.blockEl + '>');
				this._ice.element.appendChild(firstBlock);
			}
			range.setStart(firstBlock, 0);
			range.collapse(true);
			this._ice.env.selection.addRange(range);
		}
		
		this._tmpNode = this._ice.env.document.createElement(this._tmpNodeTagName);
		range.insertNode(this._tmpNode);

		switch (this.pasteType) {
			case 'formatted':
				this.setupPaste();
				break;
			case 'formattedClean':
				this.setupPaste(true);
				break;
		}
	   return true;
	},

	/**
	 * Create a temporary div and set focus to it so that the browser can paste into it. 
	 * Set a timeout to push a paste handler on to the end of the execution stack.
	 */
	setupPaste: function(stripTags) {
		var div = this.createDiv(this._pasteId), self = this;
		div.focus();

		div.onpaste = function() {
			setTimeout(function() {
				self.handlePasteValue(stripTags);
			}, 1);
		};
		return true;
	},

	/**
	 * By the time we get here, the pasted content will already be in the body. Extract the
	 * paste, format it, remove any Microsoft or extraneous tags outside of `this.preserve`
	 * and merge the pasted content into the original fragment body.
	 */
	handlePasteValue: function(stripTags) {
		// Get the pasted content.
		var html = ice.dom.getHtml(document.getElementById(this._pasteId));

		var childBlocks = ice.dom.children('<div>' + html + '</div>', this._ice.blockEl);
		if(childBlocks.length === 1 && ice.dom.getNodeTextContent('<div>' + html + '</div>') === ice.dom.getNodeTextContent(childBlocks)) {  
			html = ice.dom.getHtml(html);
		}

		if(stripTags) {
			// Strip out change tracking tags.
			html = this._ice.getCleanContent(html);
			html = this.stripPaste(html);
		}

		html = this.afterPasteClean.call(this, html);
		html = ice.dom.trim(html);

		var range = this._ice.getCurrentRange();
		range.setStartAfter(this._tmpNode);
		range.collapse(true);

		var newEl = null;
		var fragment = range.createContextualFragment(html);
		var changeid = this._ice.startBatchChange();

		// If fragment contains block level elements, most likely we will need to
		// do some splitting so we do not have P tags in P tags, etc. Split the
		// container from current selection and then insert paste contents after it.
		if(ice.dom.hasBlockChildren(fragment)) {

			// Split from current selection.
			var block = ice.dom.isChildOfTagName(this._tmpNode, this._ice.blockEl);
			range.setEndAfter(block.lastChild);
			this._ice.selection.addRange(range);
			var contents = range.extractContents();
			var newblock = this._ice.env.document.createElement(this._ice.blockEl);
			newblock.appendChild(contents);
			ice.dom.insertAfter(block, newblock);

			range.setStart(newblock, 0);
			range.collapse(true);
			this._ice.selection.addRange(range);
			var prevBlock = range.startContainer;
			var innerBlock = null, newEl = null, lastEl = null;
			
			// Paste all of the children in the fragment.
			while(fragment.firstChild) {
				if(fragment.firstChild.nodeType === 3 && !jQuery.trim(fragment.firstChild.nodeValue)) {
					fragment.removeChild(fragment.firstChild);
					continue;
				}
				// We may have blocks with text nodes at the beginning or end. For example, this paste:
				//  textnode <p>blocktext</p> <p>blocktext</p> moretext
				// In which case we wrap the leading or trailing text nodes in blocks.
				if(ice.dom.isBlockElement(fragment.firstChild)) {
					if(fragment.firstChild.textContent !== "") {
						innerBlock = null;
						var insert = null;
						if(this._ice.isTracking) {
							insert = this._ice.createIceNode('insertType');
							this._ice.addChange('insertType', [insert]);
							newEl = document.createElement(fragment.firstChild.tagName);
							insert.innerHTML = fragment.firstChild.innerHTML;
							newEl.appendChild(insert);
						} else {
							insert = newEl = document.createElement(fragment.firstChild.tagName);
							newEl.innerHTML = fragment.firstChild.innerHTML;
						}
						lastEl = insert;
						ice.dom.insertBefore(prevBlock, newEl);
					}
					fragment.removeChild(fragment.firstChild);
				} else {
					if(!innerBlock) {
						// Create a new block and append an insert
						newEl = document.createElement(this._ice.blockEl);
						ice.dom.insertBefore(prevBlock, newEl);
						if(this._ice.isTracking) {
							innerBlock = this._ice.createIceNode('insertType');
							this._ice.addChange('insertType', [innerBlock]);
							newEl.appendChild(innerBlock);
						} else {
							innerBlock = newEl;
						}
					}
					lastEl = innerBlock;
					innerBlock.appendChild(fragment.removeChild(fragment.firstChild));
				}
			}
			if(!newblock.textContent) { 
				newblock.parentNode.removeChild(newblock);
			}

		} else {
			if(this._ice.isTracking) {
				newEl = this._ice.createIceNode('insertType', fragment);
				this._ice.addChange('insertType', [newEl]);
				range.insertNode(newEl);
				lastEl = newEl;
			} else {
				var child;
				while((child = fragment.firstChild)) {
					range.insertNode(child);
					range.setStartAfter(child);
					range.collapse(true);
					lastEl = child;
				}
			}
		}
		this._ice.endBatchChange(changeid);
		this._cleanup(lastEl);
	},


	createDiv: function(id) {
		var oldEl = ice.dom.getId(id);
		if(oldEl) {
			ice.dom.empty(oldEl);
			return oldEl;
		}

		var div = this._ice.env.document.createElement('div');
		div.id = id;
		div.setAttribute('contentEditable', true);
		ice.dom.setStyle(div, 'width', '1px');
		ice.dom.setStyle(div, 'height', '1px');
		ice.dom.setStyle(div, 'overflow', 'hidden');
		ice.dom.setStyle(div, 'position', 'fixed');
		ice.dom.setStyle(div, 'top', '10px');
		ice.dom.setStyle(div, 'left', '10px');

		document.body.appendChild(div);
		return div;
	},

	/**
	 * Intercepts cut operation and handles by creating an editable div, copying the current selection
	 * into it, deleting the current selection with track changes, and selecting the contents in the 
	 * editable div.
	 */
	handleCut: function() {
		this.cutElementId = 'icecut';
		this.cutElement = this.createDiv(this.cutElementId);
		var range = this._ice.getCurrentRange();
		if(range.collapsed) return;
		var html = range.getHTMLContents();
		if (this._ice.isTracking) this._ice.deleteContents();
		else range.deleteContents();
		var crange = range.cloneRange();
		crange.collapse(true);
		this.cutElement.innerHTML = html;
		range.setStart(this.cutElement.firstChild, 0);
		range.setEndAfter(this.cutElement.lastChild, this.cutElement.lastChild.length);
		var self = this;
		// After the browser cuts out of the `cutElement`, reset the range and remove the cut element.
		setTimeout(function() {
			range.setStart(crange.startContainer, crange.startOffset);
			range.collapse(true);
			self._ice.env.selection.addRange(range);
			ice.dom.remove(this.cutElement);
		}, 10);
	},
	
	/**
	 * Strips ice change tracking tags, Microsoft Word styling/content, and any
	 * tags and attributes not found in `preserve` from the given `content`.
	 */
	stripPaste: function(content) {
		// Clean word stuff out and strip tags that are not in `this.preserve`.
		content = this._cleanWordPaste(content);
		content = this.cleanPreserved(content);
		return content;
	},

	/**
	 * Parses `preserve` to setup `_tags` with a comma delimited list of all of the 
	 * defined tags, and the `_attributesMap` with a mapping between the allowed tags and 
	 * an array of their allowed attributes. For example, given this value:
	 *   `preserve` = 'p,a[href|class],span[*]'
	 * The following will result:
	 *   `_tags` = 'p,a,span'
	 *   `_attributesMap` = ['p' => [], 'a' => ['href', 'class'], 'span' => ['*']]
	 */
	setupPreserved: function() {
		var self = this;
		this._tags = '';
		this._attributesMap = [];
		
		ice.dom.each(this.preserve.split(','), function(i, tagAttr) {
			// Extract the tag and attributes list
			tagAttr.match(/(\w+)(\[(.+)\])?/);
			var tag = RegExp.$1;
			var attr = RegExp.$3;

			if(self._tags) self._tags += ',';
			self._tags += tag.toLowerCase();
			self._attributesMap[tag] = attr.split('|'); 
		});
	},
	
	/**
	 * Cleans the given `body` by removing any tags not found in `_tags` and replacing them with
	 * their inner contents, and removes attributes from any tags that aren't mapped in `_attributesMap`.
	 */
	cleanPreserved: function(body) {
		var self = this;
		var bodyel = this._ice.env.document.createElement('div');
		bodyel.innerHTML = body;

		// Strip out any tags not found in `this._tags`, replacing the tags with their inner contents.
		bodyel = ice.dom.stripEnclosingTags(bodyel, this._tags);

		// Strip out any attributes from the allowed set of tags that don't match what is in the `_attributesMap`
		ice.dom.each(ice.dom.find(bodyel, this._tags), function(i, el) {
			var tag = el.tagName.toLowerCase();
			var attrMatches = self._attributesMap[tag];

			// Kleene star - keep all of the attributes for this tag.
			if(attrMatches[0] && attrMatches[0] === '*')
				return true;

			// Remove any foreign attributes that do not match the map.
			if(el.hasAttributes()) {
				var attributes = el.attributes;
				for(var i = attributes.length - 1; i >= 0; i--) {
					if(!ice.dom.inArray(attributes[i].name, attrMatches))
						el.removeAttribute(attributes[i].name);
				}
			}
		});
		return bodyel.innerHTML;
	},

	_cleanWordPaste: function(content) {
		// Meta and link tags.
		content = content.replace(/<(meta|link)[^>]+>/g, "");

		// Comments.
		content = content.replace(/<!--(.|\s)*?-->/g, '');

		// Remove style tags.
		content = content.replace(/<style>[\s\S]*?<\/style>/g, '');

		// Remove span and o:p etc. tags.
		//content = content.replace(/<\/?span[^>]*>/gi, "");
		content = content.replace(/<\/?\w+:[^>]*>/gi, '' );

		// Remove XML tags.
		content = content.replace(/<\\?\?xml[^>]*>/gi, '');

		// Generic cleanup.
		content = this._cleanPaste(content);

		// Convert Words orsm "lists"..
		content = this._convertWordPasteList(content);

		// Remove class, lang and style attributes.
		content = content.replace(/<(\w[^>]*) (lang)=([^ |>]*)([^>]*)/gi, "<$1$4");
		content = content.replace(new RegExp('<(\\w[^>]*) style="([^"]*)"([^>]*)', 'gi'), "<$1$3");

		return content;
	},

	_getListType: function(elem, listTypes) {
		var elContent = ice.dom.getHtml(elem);
		var info = null;
		ice.dom.foreach(listTypes, function(k) {
			ice.dom.foreach(listTypes[k], function(j) {
				ice.dom.foreach(listTypes[k][j], function(m) {
					if ((new RegExp(listTypes[k][j][m])).test(elContent) === true) {
						info = {
							html: elContent.replace(new RegExp(listTypes[k][j][m]), ''),
							listType: k,
							listStyle: j
						};
						// Break from loop.
						return false;
					}
				});

				if (info !== null) {
					// Break from loop.
					return false;
				}
			});

			if (info !== null) {
				// Break from loop.
				return false;
			}
		});

		return info;
	},

	_convertWordPasteList: function(content) {
		var div = document.createElement('div');
		var ul = null;
		var prevMargin = null;
		var indentLvl = {};
		var li = null;
		var newList	= true;

		var listTypes = {
			ul: {
				circle: ['^o(\s|&nbsp;)+'],
				disc: ['^' + String.fromCharCode(183) + '(\\s|&nbsp;)+'],
				square: ['^' + String.fromCharCode(167) + '(\\s|&nbsp;)+'],
				auto: ['^' + String.fromCharCode(8226) + '(\\s|&nbsp;)+']
			},
			ol: {
				decimal: ['^\\d+\\.(\s|&nbsp;)+'],
				'lower-roman': ['^[ivxlcdm]+\\.(\\s|&nbsp;)+'],
				'upper-roman': ['^[IVXLCDM]+\\.(\\s|&nbsp;)+'],
				'lower-alpha': ['^[a-z]+\\.(\\s|&nbsp;)+'],
				'upper-alpha': ['^[A-Z]+\\.(\\s|&nbsp;)+']
			}
		};

		ice.dom.setHtml(div, content);

		var pElems = ice.dom.getTag('p', div);
		var pln	= pElems.length;
		for (var i = 0; i < pln; i++) {
			var pEl		  = pElems[i];
			var listTypeInfo = this._getListType(pEl, listTypes);
			if (listTypeInfo !== null) {
				var marginLeft = parseInt(ice.dom.getStyle(pEl, 'margin-left'));
				var listType   = listTypeInfo.listType;
				var listStyle  = listTypeInfo.listStyle;
				ice.dom.setHtml(pEl, listTypeInfo.html);

				if (!listType) {
					listType = 'ol';
				}

				if (newList) {
					// Start a new list.
					ul = document.createElement(listType);
					indentLvl = {};
					ice.dom.attr(ul, '_icelistst', 'list-style-type:' + listStyle);

					indentLvl[marginLeft] = ul;
					ice.dom.insertBefore(pEl, ul);
				} else {
					// We determine start of sub lists by checking indentation.
					// If previous margin and current margin is not the same
					// then this is a sub-list or part of a parent list.
					if (marginLeft !== prevMargin) {
						if (ice.dom.isset(indentLvl[marginLeft]) === true) {
							// Going back up.
							ul = indentLvl[marginLeft];
						} else if (marginLeft > prevMargin) {
							// Sub list, create a new list.
							ul = document.createElement(listType);
							ice.dom.attr(ul, '_icelistst', 'list-style-type:' + listStyle);
							li.appendChild(ul);

							// Indent list.
							indentLvl[marginLeft] = ul;
						}
					}
				}//end if

				// Create a new list item.
				li = this._createListItemFromElement(pEl);
				ul.appendChild(li);

				prevMargin = marginLeft;
				ice.dom.remove(pEl);
				newList = false;
			} else {
				// Next list item will be the start of a new list.
				newList = true;
			}//end if
		}//end for

		content = ice.dom.getHtml(div);

		return content;
	},

	_createListItemFromElement: function(elem) {
		var li = document.createElement('li');
		while (elem.firstChild) {
			li.appendChild(elem.firstChild);
		}

		return li;
	},

	_cleanPaste: function(content) {
		// Some generic content cleanup. Change all b/i tags to strong/em.
		content = content.replace(/<b(\s+|>)/g, "<strong$1");
		content = content.replace(/<\/b(\s+|>)/g, "</strong$1");
		content = content.replace(/<i(\s+|>)/g, "<em$1");
		content = content.replace(/<\/i(\s+|>)/g, "</em$1");
		return content;
	},

	_cleanup: function(moveTo) {
		try {
			moveTo = moveTo && moveTo.lastChild || moveTo || this._tmpNode;
			// Move the range to the end of moveTo so that the cursor will be at the end of the paste.
			var range = this._ice.getCurrentRange();
			range.setStart(moveTo, moveTo.length);
			range.collapse(true);
			this._ice.selection.addRange(range);
			// Set focus back to ice element.
			if(this._ice.env.frame) {
				this._ice.env.frame.contentWindow.focus();
			} else {
				this._ice.element.focus();
			}
			// Kill the tmp node.
			this._tmpNode.parentNode.removeChild(this._tmpNode);
			this._tmpNode = null;
			// Kill any empty change nodes.
			var ins = this._ice.env.document.getElementsByClassName(this._ice.changeTypes['insertType'].alias);
			for(var i = 0; i < ins.length; i++) {
				if(!ins[i].textContent) {
					if(ins[i].parentNode) {
						ins[i].parentNode.removeChild(ins[i]);
					}
				}
			}
		} catch(e) {
			window.console && console.error(e);
		}
	}
};

ice.dom.noInclusionInherits(IceCopyPastePlugin, ice.IcePlugin);
exports._plugin.IceCopyPastePlugin = IceCopyPastePlugin;

}).call(this.ice);

