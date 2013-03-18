(function() {

  var exports = this, Bookmark;

  Bookmark = function(env, range, keepOldBookmarks) {

    this.env = env;
    this.element = env.element;
    this.selection = this.env.selection;

    // Remove all bookmarks?
    if (!keepOldBookmarks) {
      this.removeBookmarks(this.element);
    }

    var currRange = range || this.selection.getRangeAt(0);
    range = currRange.cloneRange();
    var startContainer = range.startContainer;
    var endContainer = range.endContainer;
    var startOffset  = range.startOffset;
    var endOffset = range.endOffset;
    var tmp;

    // Collapse to the end of range.
    range.collapse(false);

    var endBookmark  = this.env.document.createElement('span');
    endBookmark.style.display = 'none';
    ice.dom.setHtml(endBookmark, '&nbsp;');
    ice.dom.addClass(endBookmark, 'iceBookmark iceBookmark_end');
    endBookmark.setAttribute('iceBookmark', 'end');
    range.insertNode(endBookmark);
    if(!ice.dom.isChildOf(endBookmark, this.element)) {
      this.element.appendChild(endBookmark);
    }

    // Move the range to where it was before.
    range.setStart(startContainer, startOffset);
    range.collapse(true);

    // Create the start bookmark.
    var startBookmark = this.env.document.createElement('span');
    startBookmark.style.display = 'none';
    ice.dom.addClass(startBookmark, 'iceBookmark iceBookmark_start');
    ice.dom.setHtml(startBookmark, '&nbsp;');
    startBookmark.setAttribute('iceBookmark', 'start');
    try {
      range.insertNode(startBookmark);

      // Make sure start and end are in correct position.
      if (startBookmark.previousSibling === endBookmark) {
        // Reverse..
        tmp  = startBookmark;
        startBookmark = endBookmark;
        endBookmark = tmp;
      }
    } catch (e) {
      // NS_ERROR_UNEXPECTED: I believe this is a Firefox bug.
      // It seems like if the range is collapsed and the text node is empty
      // (i.e. length = 0) then Firefox tries to split the node for no reason and fails...
      ice.dom.insertBefore(endBookmark, startBookmark);
    }

    if (ice.dom.isChildOf(startBookmark, this.element) === false) {
      if (this.element.firstChild) {
        ice.dom.insertBefore(this.element.firstChild, startBookmark);
      } else {
        // Should not happen...
        this.element.appendChild(startBookmark);
      }
    }

    if (!endBookmark.previousSibling) {
      tmp = this.env.document.createTextNode('');
      ice.dom.insertBefore(endBookmark, tmp);
    }

    // The original range object must be changed.
    if (!startBookmark.nextSibling) {
      tmp = this.env.document.createTextNode('');
      ice.dom.insertAfter(startBookmark, tmp);
    }

    currRange.setStart(startBookmark.nextSibling, 0);
    currRange.setEnd(endBookmark.previousSibling, (endBookmark.previousSibling.length || 0));

    this.start = startBookmark;
    this.end = endBookmark;
  };

  Bookmark.prototype = {

    selectBookmark: function() {
      var range = this.selection.getRangeAt(0);
      var startPos = null;
      var endPos = null;
      var startOffset = 0;
      var endOffset = null;
      if (this.start.nextSibling === this.end || ice.dom.getElementsBetween(this.start, this.end).length === 0) {
        // Bookmark is collapsed.
        if (this.end.nextSibling) {
          startPos = ice.dom.getFirstChild(this.end.nextSibling);
        } else if (this.start.previousSibling) {
          startPos = ice.dom.getFirstChild(this.start.previousSibling);
          if (startPos.nodeType === ice.dom.TEXT_NODE) {
            startOffset = startPos.length;
          }
        } else {
          // Create a text node in parent.
          this.end.parentNode.appendChild(this.env.document.createTextNode(''));
          startPos = ice.dom.getFirstChild(this.end.nextSibling);
        }
      } else {
        if (this.start.nextSibling) {
          startPos = ice.dom.getFirstChild(this.start.nextSibling);
        } else {
          if (!this.start.previousSibling) {
            var tmp = this.env.document.createTextNode('');
            ice.dom.insertBefore(this.start, tmp);
          }

          startPos = ice.dom.getLastChild(this.start.previousSibling);
          startOffset = startPos.length;
        }

        if (this.end.previousSibling) {
          endPos = ice.dom.getLastChild(this.end.previousSibling);
        } else {
          endPos = ice.dom.getFirstChild(this.end.nextSibling || this.end);
          endOffset = 0;
        }
      }

      ice.dom.remove([this.start, this.end]);

      if (endPos === null) {
        range.setEnd(startPos, startOffset);
        range.collapse(false);
      } else {
        range.setStart(startPos, startOffset);
        if (endOffset === null) {
          endOffset = (endPos.length || 0);
        }
        range.setEnd(endPos, endOffset);
      }

      try {
        this.selection.addRange(range);
      } catch (e) {
        // IE may throw exception for hidden elements..
      }
    },

    getBookmark: function(parent, type) {
      var elem = ice.dom.getClass('iceBookmark_' + type, parent)[0];
      return elem;
    },

    removeBookmarks: function(elem) {
      ice.dom.remove(ice.dom.getClass('iceBookmark', elem, 'span'));
    }
  };

  exports.Bookmark = Bookmark;

}).call(this.ice);