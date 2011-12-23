(function() {

this.ice.dom.ready(document, function() {

	/**
   * Initialize and extend the `rangy` library with some custom helpers. 
   */

	rangy.init();

	rangy.config.checkSelectionRanges = false;

	/**
	 * Moves the start of the range using the specified `unitType`, by the specified
	 * number of `units`. Defaults to `CHARACTER_UNIT` and units of 1.
	 */
	rangy.rangePrototype.moveStart = function(unitType, units) {
		if (units === 0) {
			throw Error('InvalidArgumentException: units cannot be 0');
		}

		switch (unitType) {
			case ice.dom.CHARACTER_UNIT:
				if (units > 0) {
					this.moveCharRight(true, units);
				} else {
					this.moveCharLeft(true, units);
				}
			break;

			case ice.dom.WORD_UNIT:
			default:
				// Do nothing.
			break;
		}
	};

	/**
	 * Moves the end of the range using the specified `unitType`, by the specified
	 * number of `units`.
	 */
	rangy.rangePrototype.moveEnd = function(unitType, units) {
		if (units === 0) {
			throw Error('InvalidArgumentException: units cannot be 0');
		}

		switch (unitType) {
			case ice.dom.CHARACTER_UNIT:
				if (units > 0) {
					this.moveCharRight(false, units);
				} else {
					this.moveCharLeft(false, units);
				}
			break;

			case ice.dom.WORD_UNIT:
			default:
				// Do nothing.
			break;
		}
	};

	/**
	 * Depending on the given `start` boolean, sets the start or end containers
	 * to the given `container` with `offset` units.
	 */
	rangy.rangePrototype.setRange = function(start, container, offset) {
		if (start) {
			this.setStart(container, offset);
		} else {
			this.setEnd(container, offset);
		}
	};

	/**
	 * Depending on the given `moveStart` boolean, moves the start or end containers
	 * to the left by the given number of character `units`. Use the following
	 * example as a demonstration for where the range will fall as it moves in and
	 * out of tag boundaries (where "|" is the marked range):
	 *
	 * test <em>it</em> o|ut
	 * test <em>it</em> |out
	 * test <em>it</em>| out
	 * test <em>i|t</em> out
	 * test <em>|it</em> out
	 * test| <em>it</em> out
	 * tes|t <em>it</em> out
	 */
	rangy.rangePrototype.moveCharLeft = function(moveStart, units) {
		var container, offset;

		if (moveStart) {
			container = this.startContainer;
			offset	= this.startOffset;
		} else {
			container = this.endContainer;
			offset	= this.endOffset;
		}

		offset += units;

		if (offset < 0) {
			// We need to move to a previous selectable container.
			while (offset < 0) {
				var skippedBlockElem = [];
				
				// We are at the beginning of the body - break
				if(!this.getPreviousContainer(container, skippedBlockElem)) { if(units === -1) return; offset = 0; break; }

				container = this.getPreviousContainer(container, skippedBlockElem);
				
				if (container.nodeType === ice.dom.ELEMENT_NODE) {
					continue;
				}

				offset = container.data.length;
				offset--;
			}
		}

		this.setRange(moveStart, container, offset);
	};

	/**
	 * Depending on the given `moveStart` boolean, moves the start or end containers
	 * to the right by the given number of character `units`. Use the following
	 * example as a demonstration for where the range will fall as it moves in and
	 * out of tag boundaries (where "|" is the marked range):
	 *
	 * tes|t <em>it</em> out
	 * test| <em>it</em> out
	 * test |<em>it</em> out
	 * test <em>i|t</em> out
	 * test <em>it|</em> out
	 * test <em>it</em> |out
	 */
	rangy.rangePrototype.moveCharRight = function(moveStart, units) {
		var container, offset;

		if (moveStart) {
			container = this.startContainer;
			offset	= this.startOffset;
		} else {
			container = this.endContainer;
			offset	= this.endOffset;
		}

		if (container.nodeType === ice.dom.ELEMENT_NODE) {
			container = container.childNodes[offset];
			if (container.nodeType !== ice.dom.TEXT_NODE) {
				container = this.getNextTextNode(container);
			}

			offset = units;
		} else {
			offset += units;
		}

		var diff = (offset - container.data.length);
		if (diff > 0) {
			var skippedBlockElem = [];
			// We need to move to the next selectable container.
			while (diff > 0) {
				container = this.getNextContainer(container, skippedBlockElem);
				if (container.nodeType === ice.dom.ELEMENT_NODE) {
					continue;
				}

				if (container.data.length >= diff) {
					// We found a container with enough content to select.
					break;
				} else if (container.data.length > 0) {
					// Container does not have enough content,
					// find the next one.
					diff -= container.data.length;
				}
			}

			offset = diff;
		}

		this.setRange(moveStart, container, offset);
	};

	/**
	 * Returns the deepest next container that the range can be extended to.
	 * For example, if the next container is an element that contains text nodes,
	 * the the container's firstChild is returned.
	 */
	rangy.rangePrototype.getNextContainer = function(container, skippedBlockElem) {
		if (!container) {
			return null;
		}

		while (container.nextSibling) {
			container = container.nextSibling;
			if (container.nodeType !== ice.dom.TEXT_NODE) {
				var child = this.getFirstSelectableChild(container);
				if (child !== null) {
					return child;
				}
			} else if (this.isSelectable(container) === true) {
				return container;
			}
		}

		// Look at parents next sibling.
		while (container && !container.nextSibling) {
			container = container.parentNode;
		}

		if (!container) {
			return null;
		}

		container = container.nextSibling;
		if (this.isSelectable(container) === true) {
			return container;
		} else if (skippedBlockElem && ice.dom.isBlockElement(container) === true) {
			skippedBlockElem.push(container);
		}

		var selChild = this.getFirstSelectableChild(container);
		if (selChild !== null) {
			return selChild;
		}

		return this.getNextContainer(container, skippedBlockElem);
	};

	/**
	 * Returns the deepest previous container that the range can be extended to.
	 * For example, if the previous container is an element that contains text nodes,
	 * the the container's lastChild is returned.
	 */
	rangy.rangePrototype.getPreviousContainer = function(container, skippedBlockElem) {
		if (!container) {
			return null;
		}

		while (container.previousSibling) {
			container = container.previousSibling;
			if (container.nodeType !== ice.dom.TEXT_NODE) {
				if (ice.dom.isStubElement(container) === true) {
					return container;
				} else {
					var child = this.getLastSelectableChild(container);
					if (child !== null) {
						return child;
					}
				}
			} else if (this.isSelectable(container) === true) {
				return container;
			}
		}

		// Look at parents next sibling.
		while (container && !container.previousSibling) {
			container = container.parentNode;
		}

		if (!container) {
			return null;
		}

		container = container.previousSibling;
		if (this.isSelectable(container) === true) {
			return container;
		} else if (skippedBlockElem && ice.dom.isBlockElement(container) === true) {
			skippedBlockElem.push(container);
		}

		var selChild = this.getLastSelectableChild(container);
		if (selChild !== null) {
			return selChild;
		}
		return this.getPreviousContainer(container, skippedBlockElem);
	};

	/**
	 * If incSpaces is false then any space at the beginning of a line will
	 * be ignored.
	 */
	rangy.rangePrototype.getStartOffset = function(incSpaces) {
		if (incSpaces === true) {
			return this.startOffset;
		}

		var spaces	= 0;
		var container = this.startContainer;
		var cc		= container.data.charCodeAt(0);
		while (cc === 10 || cc === 32) {
			spaces++;
			cc = container.data.charCodeAt(spaces);
		}

		var offset = (this.startOffset - spaces);

		return offset;
	};

	rangy.rangePrototype.getNextTextNode = function(container) {
		if (container.nodeType === ice.dom.ELEMENT_NODE) {
			if (container.childNodes.length !== 0) {
				return this.getFirstSelectableChild(container);
			}
		}

		container = this.getNextContainer(container);
		if (container.nodeType === ice.dom.TEXT_NODE) {
			return container;
		}

		return this.getNextTextNode(container);
	};

	rangy.rangePrototype.getFirstSelectableChild = function(element) {
		if (element) {
			if (element.nodeType !== ice.dom.TEXT_NODE) {
				var child = element.firstChild;
				while (child) {
					if (this.isSelectable(child) === true) {
						return child;
					} else if (child.firstChild) {
						// This node does have child nodes.
						var res = this.getFirstSelectableChild(child);
						if (res !== null) {
							return res;
						} else {
							child = child.nextSibling;
						}
					} else {
						child = child.nextSibling;
					}
				}
			} else {
				// Given element is a text node so return it.
				return element;
			}
		}
		return null;
	};

	rangy.rangePrototype.getLastSelectableChild = function(element) {
		if (element) {
			if (element.nodeType !== ice.dom.TEXT_NODE) {
				var child = element.lastChild;
				while (child) {
					if (this.isSelectable(child) === true) {
						return child;
					} else if (child.lastChild) {
						// This node does have child nodes.
						var res = this.getLastSelectableChild(child);
						if (res !== null) {
							return res;
						} else {
							child = child.previousSibling;
						}
					} else {
						child = child.previousSibling;
					}
				}
			} else {
				// Given element is a text node so return it.
				return element;
			}
		}
		return null;
	};
	
	rangy.rangePrototype.isSelectable = function(container) {
		if (container && container.nodeType === ice.dom.TEXT_NODE && container.data.length !== 0) {
			return true;
		}
		return false;
	};
	
	rangy.rangePrototype.getHTMLContents = function(clonedSelection) {
		if (!clonedSelection) {
			clonedSelection = this.cloneContents();
		}
		var div = ice.env.document.createElement('div');
		div.appendChild(clonedSelection.cloneNode(true));
		return div.innerHTML;
	};

	rangy.rangePrototype.getHTMLContentsObj = function() {
		return this.cloneContents();
	};

});


}).call(this);
