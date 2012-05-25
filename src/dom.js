(function() {

var exports = this, dom = {};

dom.DOM_VK_DELETE = 8;
dom.DOM_VK_LEFT = 37;
dom.DOM_VK_UP = 38;
dom.DOM_VK_RIGHT = 39;
dom.DOM_VK_DOWN = 40;
dom.DOM_VK_ENTER = 13;
dom.ELEMENT_NODE = 1;
dom.ATTRIBUTE_NODE = 2;
dom.TEXT_NODE = 3;
dom.CDATA_SECTION_NODE = 4;
dom.ENTITY_REFERENCE_NODE = 5;
dom.ENTITY_NODE = 6;
dom.PROCESSING_INSTRUCTION_NODE = 7;
dom.COMMENT_NODE = 8;
dom.DOCUMENT_NODE = 9;
dom.DOCUMENT_TYPE_NODE = 10;
dom.DOCUMENT_FRAGMENT_NODE = 11;
dom.NOTATION_NODE = 12;
dom.CHARACTER_UNIT = 'character';
dom.WORD_UNIT = 'word';

dom.getKeyChar = function (e) {
	return String.fromCharCode(e.which);
};
dom.getClass = function (className, startElement, tagName) {
	if (!startElement) {
		startElement = document.body;
	}
	className = '.' + className.split(' ').join('.');
	if (tagName) {
		className = tagName + className;
	}
	return jQuery.makeArray(jQuery(startElement).find(className));
};
dom.getId = function (id, startElement) {
	if (!startElement) {
		startElement = document;
	}
	element = startElement.getElementById(id);
	return element;
};
dom.getTag = function (tagName, startElement) {
	if (!startElement) {
		startElement = document;
	}
	return jQuery.makeArray(jQuery(startElement).find(tagName));
};
dom.getElementWidth = function (element) {
	return element.offsetWidth;
};
dom.getElementHeight = function (element) {
	return element.offsetHeight;
};
dom.getElementDimensions = function (element) {
	var result = {
		'width': dom.getElementWidth(element),
		'height': dom.getElementHeight(element)
	};
	return result;
};
dom.trim = function (string) {
	return jQuery.trim(string);
};
dom.empty = function (element) {
	if (element) {
		return jQuery(element).empty();
	}
};
dom.remove = function (element) {
	if (element) {
		return jQuery(element).remove();
	}
};
dom.prepend = function (parent, elem) {
	jQuery(parent).prepend(elem);
};
dom.append = function (parent, elem) {
	jQuery(parent).append(elem);
};
dom.insertBefore = function (before, elem) {
	jQuery(before).before(elem);
};
dom.insertAfter = function (after, elem) {
	jQuery(after).after(elem);
};
dom.getHtml = function (element) {
	return jQuery(element).html();
};
dom.setHtml = function (element, content) {
	if (element) {
		jQuery(element).html(content);
	}
};
dom.contents = function(el) {
	return jQuery(el).contents();
};
/**
 * Returns the inner contents of `el` as a DocumentFragment.
 */
dom.extractContent = function(el) {
	var frag = document.createDocumentFragment(), child;
	while((child = el.firstChild)) {
		frag.appendChild(child);
	}
	return frag;
},
	
/**
 * Returns this `node` or the first parent tracking node that matches the given `selector`.
 */
dom.getNode = function(node, selector) {
	return dom.is(node, selector) ? node : dom.parents(node, selector)[0] || null;
},

dom.getParents = function (elements, filter, stopEl) {
	var res = jQuery(elements).parents(filter);
	var ln = res.length;
	var ar = [];
	for (var i = 0; i < ln; i++) {
		if (res[i] === stopEl) {
			break;
		}
		ar.push(res[i]);
	}
	return ar;
};
dom.hasBlockChildren = function(parent) {
	var c = parent.childNodes.length;
	for(var i = 0; i < c; i++) {
		if(parent.childNodes[i].nodeType === dom.ELEMENT_NODE) {
			if(dom.isBlockElement(parent.childNodes[i]) === true) {
				return true;
			}
		}
	}
	return false;
};
dom.removeTag = function(element, selector) {
	jQuery(element).find(selector).replaceWith(function() {
		return jQuery(this).contents();
	});
	return element;
};
dom.stripEnclosingTags = function(content, allowedTags) {
	var c = jQuery(content);
	c.find('*').not(allowedTags).replaceWith(function() {
		var $this = jQuery(this);
		return $this.contents();
	});
	return c[0];
};
dom.getSiblings = function (element, dir, elementNodesOnly, stopElem) {
	if (elementNodesOnly === true) {
		if (dir === 'prev') {
			return jQuery(element).prevAll();
		} else {
			return jQuery(element).nextAll();
		}
	} else {
		var elems = [];
		if (dir === 'prev') {
			while (element.previousSibling) {
				element = element.previousSibling;
				if (element === stopElem) {
					break;
				}
				elems.push(element);
			}
		} else {
			while (element.nextSibling) {
				element = element.nextSibling;
				if (element === stopElem) {
					break;
				}
				elems.push(element);
			}
		}
		return elems;
	}
};
dom.getNodeTextContent = function (node) {
	return jQuery(node).text();
};
dom.setNodeTextContent = function (node, txt) {
	return jQuery(node).text(txt);
};
dom.getTagName = function(node) {
	return node.tagName && node.tagName.toLowerCase() || null;
};
dom.getIframeDocument = function (iframe) {
	var doc = null;
	if (iframe.contentDocument) {
		doc = iframe.contentDocument;
	} else if (iframe.contentWindow) {
		doc = iframe.contentWindow.document;
	} else if (iframe.document) {
		doc = iframe.document;
	}
	return doc;
};
dom.isBlockElement = function (element) {
	switch (element.nodeName.toLowerCase()) {
	case 'p':
	case 'div':
	case 'pre':
	case 'ul':
	case 'ol':
	case 'li':
	case 'table':
	case 'tbody':
	case 'td':
	case 'th':
	case 'fieldset':
	case 'form':
	case 'blockquote':
	case 'dl':
	case 'dir':
	case 'center':
	case 'address':
	case 'h1':
	case 'h2':
	case 'h3':
	case 'h4':
	case 'h5':
	case 'h6':
	//case 'img':
		return true;
		break;
	default:
		return false;
		break;
	}
	return false;
};
dom.isStubElement = function (element) {
	if (element) {
		switch (element.nodeName.toLowerCase()) {
		case 'img':
		case 'br':
		case 'hr':
		case 'iframe':
		case 'param':
		case 'link':
		case 'meta':
		case 'input':
		case 'frame':
		case 'col':
		case 'base':
		case 'area':
			return true;
			break;
		default:
			return false;
			break;
		}
	}
	return false;
};
dom.isChildOf = function (el, parent) {
	try {
		while (el && el.parentNode) {
			if (el.parentNode === parent) {
				return true;
			}
			el = el.parentNode;
		}
	} catch (e) {}
	return false;
};
dom.isChildOfTagName = function (el, name) {
	var parentNode = null;
	try {
		while (el && el.parentNode) {
			if (el.parentNode && el.parentNode.tagName && el.parentNode.tagName.toLowerCase() === name) {
				parentNode = el.parentNode;
			}
			el = el.parentNode;
		}
	} catch (e) {}
	return parentNode;
};


dom.isChildOfTagNames = function (el, names) {
	var parentNode = null;
	try {
		while (el && el.parentNode) {
			if (el.parentNode && el.parentNode.tagName) {
				tagName = el.parentNode.tagName.toLowerCase();
				for (var i = 0; i < names.length; i++) {
					if (tagName === names[i]) {
						parentNode = el.parentNode;
						break;
					}
				}
			}
			el = el.parentNode;
		}
	} catch (e) {}
	return parentNode;
};

dom.isChildOfClassName = function (el, name) {
	var parentNode = null;
	try {
		while (el && el.parentNode) {
			if(jQuery(el.parentNode).hasClass(name))
				parentNode = el.parentNode;
			el = el.parentNode;
		}
	} catch (e) {}
	return parentNode;
};
dom.cloneNode = function (elems, cloneEvents) {
	if (cloneEvents === undefined) {
		cloneEvents = true;
	}
	return jQuery(elems).clone(cloneEvents);
};

dom.bind = function(element, event, callback) {
	return jQuery(element).bind(event, callback);
};

dom.attr = function (elements, key, val) {
	if(val)
		return jQuery(elements).attr(key, val);
	else
		return jQuery(elements).attr(key);
};
dom.replaceWith = function (node, replacement) {
	return jQuery(node).replaceWith(replacement);
};
dom.removeAttr = function (elements, name) {
	jQuery(elements).removeAttr(name);
};
dom.getElementsBetween = function (fromElem, toElem) {
	var elements = [];
	if (fromElem === toElem) {
		return elements;
	}
	if (dom.isChildOf(toElem, fromElem) === true) {
		var fElemLen = fromElem.childNodes.length;
		for (var i = 0; i < fElemLen; i++) {
			if (fromElem.childNodes[i] === toElem) {
				break;
			} else if (dom.isChildOf(toElem, fromElem.childNodes[i]) === true) {
				return dom.arrayMerge(elements, dom.getElementsBetween(fromElem.childNodes[i], toElem));
			} else {
				elements.push(fromElem.childNodes[i]);
			}
		}
		return elements;
	}
	var startEl = fromElem.nextSibling;
	while (startEl) {
		if (dom.isChildOf(toElem, startEl) === true) {
			elements = dom.arrayMerge(elements, dom.getElementsBetween(startEl, toElem));
			return elements;
		} else if (startEl === toElem) {
			return elements;
		} else {
			elements.push(startEl);
			startEl = startEl.nextSibling;
		}
	}
	var fromParents = dom.getParents(fromElem);
	var toParents = dom.getParents(toElem);
	var parentElems = dom.arrayDiff(fromParents, toParents, true);
	var pElemLen = parentElems.length;
	for (var j = 0; j < (pElemLen - 1); j++) {
		elements = dom.arrayMerge(elements, dom.getSiblings(parentElems[j], 'next'));
	}
	var lastParent = parentElems[(parentElems.length - 1)];
	elements = dom.arrayMerge(elements, dom.getElementsBetween(lastParent, toElem));
	return elements;
};
dom.getCommonAncestor = function (a, b) {
	var node = a;
	while (node) {
		if (dom.isChildOf(b, node) === true) {
			return node;
		}
		node = node.parentNode;
	}
	return null;
};
dom.getNextNode = function (node) {
	if (node.nextSibling) {
		return node.nextSibling;
	} else if (node.parentNode) {
		return dom.getFirstChild(node.parentNode);
	}
	return null;
};
dom.getPrevNode = function (node) {
	if (node.previousSibling) {
		return node.previousSibling;
	} else if (node.parentNode) {
		return dom.getLastChild(node.parentNode);
	}
	return null;
};
dom.getFirstChild = function (node) {
	if (node.firstChild) {
		if (node.firstChild.nodeType === dom.ELEMENT_NODE) {
			return dom.getFirstChild(node.firstChild);
		} else {
			return node.firstChild;
		}
	}
	return node;
};
dom.getLastChild = function (node) {
	if (node.lastChild) {
		if (node.lastChild.nodeType === dom.ELEMENT_NODE) {
			return dom.getLastChild(node.lastChild);
		} else {
			return node.lastChild;
		}
	}
	return node;
};
dom.removeEmptyNodes = function (parent, callback) {
	var elems = jQuery(parent).find(':empty');
	var i = elems.length;
	while (i > 0) {
		i--;
		if (dom.isStubElement(elems[i]) === false) {
			if (!callback || callback.call(this, elems[i]) !== false) {
				dom.remove(elems[i]);
			}
		}
	}
};
dom.create = function(html) {
	return jQuery(html)[0];
};
dom.find = function (parent, exp) {
	return jQuery(parent).find(exp);
};
dom.children = function (parent, exp) {
	return jQuery(parent).children(exp);
};
dom.parent = function (child, exp) {
	return jQuery(child).parent(exp)[0];
};
dom.parents = function(child, exp) {
	return jQuery(child).parents(exp);
};
dom.is = function (node, exp) {
	return jQuery(node).is(exp);
};
dom.extend = function(deep, target, object1, object2) {
	return jQuery.extend.apply(this, arguments);
};
dom.walk = function (elem, callback, lvl) {
	if (!elem) {
		return;
	}
	if (!lvl) {
		lvl = 0;
	}
	var retVal = callback.call(this, elem, lvl);
	if (retVal === false) {
		return;
	}
	if (elem.childNodes && elem.childNodes.length > 0) {
		dom.walk(elem.firstChild, callback, (lvl + 1));
	} else if (elem.nextSibling) {
		dom.walk(elem.nextSibling, callback, lvl);
	} else if (elem.parentNode && elem.parentNode.nextSibling) {
		dom.walk(elem.parentNode.nextSibling, callback, (lvl - 1));
	}
};
dom.revWalk = function (elem, callback) {
	if (!elem) {
		return;
	}
	var retVal = callback.call(this, elem);
	if (retVal === false) {
		return;
	}
	if (elem.childNodes && elem.childNodes.length > 0) {
		dom.walk(elem.lastChild, callback);
	} else if (elem.previousSibling) {
		dom.walk(elem.previousSibling, callback);
	} else if (elem.parentNode && elem.parentNode.previousSibling) {
		dom.walk(elem.parentNode.previousSibling, callback);
	}
};
dom.setStyle = function (element, property, value) {
	if (element) {
		jQuery(element).css(property, value);
	}
};
dom.getStyle = function (element, property) {
	return jQuery(element).css(property);
};
dom.hasClass = function (element, className) {
	return jQuery(element).hasClass(className);
};
dom.addClass = function (element, classNames) {
	jQuery(element).addClass(classNames);
};
dom.removeClass = function (element, classNames) {
	jQuery(element).removeClass(classNames);
};
dom.preventDefault = function (e) {
	e.preventDefault();
	dom.stopPropagation(e);
};
dom.stopPropagation = function (e) {
	e.stopPropagation();
};
dom.noInclusionInherits = function (child, parent) {
	if (parent instanceof String || typeof parent === 'string') {
		parent = window[parent];
	}
	if (child instanceof String || typeof child === 'string') {
		child = window[child];
	}
	var above = function () {};
	if (dom.isset(parent) === true) {
		for (value in parent.prototype) {
			if (child.prototype[value]) {
				above.prototype[value] = parent.prototype[value];
				continue;
			}
			child.prototype[value] = parent.prototype[value];
		}
	}
	if (child.prototype) {
		above.prototype.constructor = parent;
		child.prototype['super'] = new above();
	}
};

dom.each = function(val, callback) {
	jQuery.each(val, function(i, el) {
		callback.call(this, i, el);
	});
};

dom.foreach = function (value, cb) {
	if (value instanceof Array || value instanceof NodeList || typeof value.length != 'undefined' && typeof value.item !='undefined') {
		var len = value.length;
		for (var i = 0; i < len; i++) {
			var res = cb.call(this, i, value[i]);
			if (res === false) {
				break;
			}
		}
	} else {
		for (var id in value) {
			if (value.hasOwnProperty(id) === true) {
				var res = cb.call(this, id);
				if (res === false) {
					break;
				}
			}
		}
	}
};
dom.isBlank = function (value) {
	if (!value || /^\s*$/.test(value)) {
		return true;
	}
	return false;
};
dom.isFn = function (f) {
	if (typeof f === 'function') {
		return true;
	}
	return false;
};
dom.isObj = function (v) {
	if (v !== null && typeof v === 'object') {
		return true;
	}
	return false;
};
dom.isset = function (v) {
	if (typeof v !== 'undefined' && v !== null) {
		return true;
	}
	return false;
};
dom.isArray = function (v) {
	return jQuery.isArray(v);
};
dom.isNumeric = function (str) {
	var result = str.match(/^\d+$/);
	if (result !== null) {
		return true;
	}
	return false;
};
dom.getUniqueId = function () {
	var timestamp = (new Date()).getTime();
	var random = Math.ceil(Math.random() * 1000000);
	var id = timestamp + '' + random;
	return id.substr(5, 18).replace(/,/, '');
};
dom.inArray = function (needle, haystack) {
	var hln = haystack.length;
	for (var i = 0; i < hln; i++) {
		if (needle === haystack[i]) {
			return true;
		}
	}
	return false;
};
dom.arrayDiff = function (array1, array2, firstOnly) {
	var al = array1.length;
	var res = [];
	for (var i = 0; i < al; i++) {
		if (dom.inArray(array1[i], array2) === false) {
			res.push(array1[i]);
		}
	}
	if (firstOnly !== true) {
		al = array2.length;
		for (var i = 0; i < al; i++) {
			if (dom.inArray(array2[i], array1) === false) {
				res.push(array2[i]);
			}
		}
	}
	return res;
};
dom.arrayMerge = function (array1, array2) {
	var c = array2.length;
	for (var i = 0; i < c; i++) {
		array1.push(array2[i]);
	}
	return array1;
};
/**
 * Removes allowedTags from the given content html string. If allowedTags is a string, then it
 * is expected to be a selector; otherwise, it is expected to be array of string tag names.
 */
dom.stripTags = function (content, allowedTags) {
	if(typeof allowedTags === "string") {
		var c = jQuery('<div>' + content + '</div>');
		c.find('*').not(allowedTags).remove();
		return c.html();
	}
	else {
		var match;
		var re = new RegExp(/<\/?(\w+)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/gim);
		var resCont = content;
		while ((match = re.exec(content)) != null) {
			if (dom.isset(allowedTags) === false || dom.inArray(match[1], allowedTags) !== true) {
				resCont = resCont.replace(match[0], '');
			}
		}
		return resCont;
	}
};
dom.browser = function () {
	var result = {};
	result.version = jQuery.browser.version;
	if (jQuery.browser.mozilla === true) {
		result.type = 'mozilla';
	} else if (jQuery.browser.msie === true) {
		result.type = 'msie';
	} else if (jQuery.browser.opera === true) {
		result.type = 'opera';
	} else if (jQuery.browser.safari === true) {
		result.type = 'safari';
	}
	return result;
};
dom.getBrowserType = function() {
	if (this._browserType === null) {
		var tests = ['msie', 'firefox', 'chrome', 'safari'];
		var tln   = tests.length;
		for (var i = 0; i < tln; i++) {
			var r = new RegExp(tests[i], 'i');
			if (r.test(navigator.userAgent) === true) {
				this._browserType = tests[i];
				return this._browserType;
			}
		}

		this._browserType = 'other';
	}
	return this._browserType;
};
dom.isBrowser = function(browser) {
	return (dom.browser().type === browser);
};

dom.getBlockParent = function(node, container) {
	if(node) {
		while(node.parentNode) {
			node = node.parentNode;
			if(node === container) {
				return null;
			}

			if(dom.isBlockElement(node) === true) {
				return node;
			}
		}
	}
	return null;
};

dom.onBlockBoundary = function(leftContainer, rightContainer, blockEls) {
	if(!leftContainer || !rightContainer) return false
	var bleft = dom.isChildOfTagNames(leftContainer, blockEls) || dom.is(leftContainer, blockEls.join(', ')) && leftContainer || null;
	var bright = dom.isChildOfTagNames(rightContainer, blockEls) || dom.is(rightContainer, blockEls.join(', ')) && rightContainer || null;
	return (bleft !== bright);
};

dom.isOnBlockBoundary = function(leftContainer, rightContainer, container) {
	if(!leftContainer || !rightContainer) return false
	var bleft = dom.getBlockParent(leftContainer, container) || dom.isBlockElement(leftContainer, container) && leftContainer || null;
	var bright = dom.getBlockParent(rightContainer, container) || dom.isBlockElement(rightContainer, container) && rightContainer || null;
	return (bleft !== bright);
};

dom.mergeContainers = function(node, mergeToNode) {
	if(!node || !mergeToNode) return false;

	if(node.nodeType === dom.TEXT_NODE || dom.isStubElement(node)) {
		// Move only this node.
		mergeToNode.appendChild(node);
	} else if(node.nodeType === dom.ELEMENT_NODE) {
		// Move all the child nodes to the new parent.
		while(node.firstChild) {
			mergeToNode.appendChild(node.firstChild);
		}

		dom.remove(node);
	}
	return true;
};

dom.mergeBlockWithSibling = function(range, block, next) {
	var siblingBlock = next ? $(block).next().get(0) : $(block).prev().get(0); // block['nextSibling'] : block['previousSibling'];
	if(next)
		dom.mergeContainers(siblingBlock, block);
	else
		dom.mergeContainers(block, siblingBlock);
	range.collapse(true);
	return true;
};
	
dom.date = function (format, timestamp, tsIso8601) {
	if (timestamp === null && tsIso8601) {
		timestamp = dom.tsIso8601ToTimestamp(tsIso8601);
		if (!timestamp) {
			return;
		}
	}
	var date = new Date(timestamp);
	var formats = format.split('');
	var fc = formats.length;
	var dateStr = '';
	for (var i = 0; i < fc; i++) {
		var r = '';
		var f = formats[i];
		switch (f) {
		case 'D':
		case 'l':
			var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			r = names[date.getDay()];
			if (f === 'D') {
				r = r.substring(0, 3);
			}
			break;
		case 'F':
		case 'm':
			r = date.getMonth() + 1;
			if(r < 10) r = '0' + r;
			break;
		case 'M':
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			r = months[date.getMonth()];
			if (f === 'M') {
				r = r.substring(0, 3);
			}
			break;
		case 'd':
			r = date.getDate();
			break;
		case 'S':
			r = dom.getOrdinalSuffix(date.getDate());
			break;
		case 'Y':
			r = date.getFullYear();
			break;
		case 'y':
			r = date.getFullYear();
			r = r.toString().substring(2);
			break;
		case 'H':
			r = date.getHours();
			break;
		case 'h':
			r = date.getHours();
			if (r === 0) {
				r = 12;
			} else if (r > 12) {
				r -= 12;
			}
			break;
		case 'i':
			r = dom.addNumberPadding(date.getMinutes());
			break;
		case 'a':
			r = 'am';
			if (date.getHours() >= 12) {
				r = 'pm';
			}
			break;
		default:
			r = f;
			break;
		}
		dateStr += r;
	}
	return dateStr;
};
dom.getOrdinalSuffix = function (number) {
	var suffix = '';
	var tmp = (number % 100);
	if (tmp >= 4 && tmp <= 20) {
		suffix = 'th';
	} else {
		switch (number % 10) {
		case 1:
			suffix = 'st';
			break;
		case 2:
			suffix = 'nd';
			break;
		case 3:
			suffix = 'rd';
			break;
		default:
			suffix = 'th';
			break;
		}
	}
	return suffix;
};
dom.addNumberPadding = function (number) {
	if (number < 10) {
		number = '0' + number;
	}
	return number;
};
dom.tsIso8601ToTimestamp = function (tsIso8601) {
	var regexp = /(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d\d)(?::?(\d\d))?)?)?)?)?)?/;
	var d = tsIso8601.match(new RegExp(regexp));
	if (d) {
		var date = new Date();
		date.setDate(d[3]);
		date.setFullYear(d[1]);
		date.setMonth(d[2] - 1);
		date.setHours(d[4]);
		date.setMinutes(d[5]);
		date.setSeconds(d[6]);
		var offset = (d[9] * 60);
		if (d[8] === '+') {
			offset *= -1;
		}
		offset -= date.getTimezoneOffset();
		var timestamp = (date.getTime() + (offset * 60 * 1000));
		return timestamp;
	}
	return null;
};

exports.dom = dom;

}).call(this.ice);
