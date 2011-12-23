(function() {

var exports = this, ice = this.ice;

var IceSmartQuotesPlugin = function(ice_instance) {
	this._ice = ice_instance;
}

IceSmartQuotesPlugin.prototype = {

	/**
	 * Finds each block in `element` and converts quotes into smart quotes.
	 */
	convert: function(element) {
		var self = this;
		ice.dom.each(element.getElementsByTagName(this.ice.blockEl), function(i, el) {
			var deletes = [];
			try {
				self.ice.placeholdDeletes();
				self._convertBlock(el);
			} catch(e) {
				console.error(e);
			} finally {
				self.ice.revertDeletePlaceholders();
			}
		});
	},
	
	/**
	 * Converts quotes in `el` into smart quotes - uses a range to move through `el`, one 
	 * character at a time, keeping an updated context for the `previous`, `current`, and 
	 * `next` characters, and converts any quotes, depending on their context, into smart 
	 * quotes.
	 */
	_convertBlock: function(el) {
		// If there are less than 2 characters, don't even bother.
		if(el.textContent.length < 2) return;
		
		var single = "'";
		var duble = '"'; // misspelled since `double` is a future reserved word
		var smartSingleLeft = String.fromCharCode(8216);  // aka - open curly single quote
		var smartSingleRight = String.fromCharCode(8217); // aka - close curly single quote
		var smartDoubleLeft = String.fromCharCode(8220);  // aka - open curly double quote
		var smartDoubleRight = String.fromCharCode(8221); // aka - close curly double quote
		var isDigit = function(c) { return /\d/.test(c); };
		var isChar = function(c) { return /\w/.test(c); };
		var isSpace = function(c) { return c === String.fromCharCode(160) || c === String.fromCharCode(32); };
		var isNonSpace = function(c) { return !isSpace(c); };
		var isDouble = function(c) { return c === duble || c === smartDoubleLeft || c === smartDoubleRight; };
		var isSingle = function(c) { return c === single || c === smartSingleLeft || c === smartSingleRight; };
		
		var range = this.ice.selection.createRange();
		var block = el.cloneNode(true);
		range.setStart(block, 0);
		range.collapse(true);
		
		var charList = [], previous = null, current = null, next = null, pos = 0;
		
		// Move through the range, one character at a time, and push the characters onto a list.
		while(true) {
			try {
				range.moveEnd('character', 1);
				charList.push(range.cloneContents().textContent.charAt(pos++));
			} catch(e) { break; }
		}
		
		// Move through the character list and convert any single/double quote in the current positon 
		// by looking at the previous and next positions.
		for(pos = 0; pos <= charList.length; pos++) {
			
			previous = current;
			current = next;
			next = charList.length === pos ? null : charList[pos];
			//console.log('previous: ' + previous + ' current: ' + current + ' next: ' + next);
			
			switch(current) {
				
				/**
				 * RULES for conversion:
				 * 
				 * START: assign smart left/open
				 * [SPACE]'word ...
				 * [SPACE]"word ...
				 * 
				 * END: assign smart right/close
				 * ... word'[SPACE]
				 * ... word"[SPACE]
				 * 
				 * PLURAL_CONTRACTION: assign smart right/close
				 * Matt's
				 * can't
				 * O'Reilly
				 * 
				 * YEAR_ABBREVIATION: assign smart right/close
				 * [SPACE]'99[SPACE]
				 * 
				 * NESTED_START: assign smart left/open
				 * [SPACE]"[SPACE]'word ...
				 * 
				 * NESTED_END: assign smart left/open
				 * ... word'[SPACE]"[SPACE]
				 * 
				 * MEASUREMENT: assign no smart quotes
				 * ... 6'8"
				 * ... 6' 8"
				 * ... 6'
				 * ... 8"
				 * 
				 * Notes:
				 * - The following will not be converted correctly - ...word 'Til Death - it should
				 *   get a right/close smart quote, but will get a left/open.
				 * - Distinguishing between year abbreviation, '99, and when to use an open single quote
				 *   could fail if a single quoted region starts with a double digit number - '99 problems'
				 * - Since they are a rare case and there are many permutations, measurements are not being
				 *   handled.
				 * 
				 */

				// Convert smart single quotes to non-smart quote and fall through to single quote 
				// handling, in case the context has changed and we need to update the smart quote.
				case smartSingleLeft:
				case smartSingleRight:
					this.replaceCharAtPosition(single, pos, el);
				case single:
					// YEAR_ABBREVIATION - look 2 ahead to see if there are two digits in a row - not fool proof
					if((previous === null || isSpace(previous)) && (isDigit(next) && isDigit(charList[pos+1]) && isSpace(charList[pos+2])))
						this.replaceCharAtPosition(smartSingleRight, pos, el);
					// START
					else if(previous === null || (isSpace(previous) && isNonSpace(next)))
						this.replaceCharAtPosition(smartSingleLeft, pos, el);
					// END
					else if(next === null || (isNonSpace(previous) && isSpace(next)))
						this.replaceCharAtPosition(smartSingleRight, pos, el);
					// PLURAL_CONTRACTION
					else if(isChar(previous) && isChar(next))
						this.replaceCharAtPosition(smartSingleRight, pos, el);
					break;
				
				// Convert smart double quotes to non-smart quote and fall through to double quote 
				// handling, in case the context has changed and we need to update the smart quote.
				case smartDoubleLeft:
				case smartDoubleRight:
					this.replaceCharAtPosition(duble, pos, el);
				case duble:
					// START
					if(previous === null || (isSpace(previous) && isNonSpace(next)))
						this.replaceCharAtPosition(smartDoubleLeft, pos, el);
					// END
					else if(next === null || (isNonSpace(previous) && isSpace(next)))
						this.replaceCharAtPosition(smartDoubleRight, pos, el);
					// NESTED_START
					else if((previous === null || isSpace(previous)) && (isSpace(next) && isSingle(charList[pos+1])))
						this.replaceCharAtPosition(smartDoubleLeft, pos, el);
					// NESTED_END
					else if((next === null || isSpace(next)) && (isSpace(previous) && isSingle(charList[pos-3])))
						this.replaceCharAtPosition(smartDoubleRight, pos, el);
					break;

			}
		}
	},

	replaceCharAtPosition: function(c, pos, el) {
		var range = this.ice.selection.createRange();
		range.setStart(el, 0);
		while(pos-- > 1) {
			range.moveStart('character', 1);
		}
		try {
			range.moveStart('character', 1);
			range.moveStart('character', -1);
		} catch(e) {}
		range.collapse(true);
		range.moveEnd('character', 1);
		range.extractContents();
		this.ice.insert(c, range);
	}

};

ice.dom.noInclusionInherits(IceSmartQuotesPlugin, ice.IcePlugin);
exports.ice._plugin.IceSmartQuotesPlugin = IceSmartQuotesPlugin;

}).call(this);
