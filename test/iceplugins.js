$(document).ready(function() {
/*
  QUnit.module("ice plugin", function() {

    QUnit.test("IceCopyPastePlugin.handleFormattedPasteValue", function(assert) {
      
      // We can't simulate a browser paste with javascript, so we have to mock a temp node
      // and the original body fragment before calling handleFormatted Paste.

      // Basic text paste test.		
      var el = jQuery('<div/>');
      var changeEditor = getIce(el);
      // Setup the pasted content.
      el.html('Some content');
      var pastePlugin = changeEditor.pluginsManager.plugins['IceCopyPastePlugin'];
      // Setup the original body fragment with a temp node (marker for where paste is handled).
      var $frag = jQuery('<div>\
        <p><icepaste/>A paragraph.</p>\
      </div>');
      pastePlugin._tmpNode = $frag.find('icepaste')[0];
      var fragment = ice.dom.extractContent($frag[0]);
      pastePlugin.handleFormattedPasteValue(fragment, true);

      assert.ok(el.text().trim() === 'Some contentA paragraph.', 'Text content was pasted in correctly.');


      // Test pasting blocks (blocks are paragraphs)
      el = jQuery('<div/>');
      changeEditor = getIce(el);
      // Setup the pasted content.
      el.html('text <p>paragraph</p> text');
      pastePlugin = changeEditor.pluginsManager.plugins['IceCopyPastePlugin'];
      // Setup the original body fragment with a temp node (marker for where paste is handled).
      $frag = jQuery('<div>\
        <p>First <icepaste/>paragraph.</p>\
      </div>');
      pastePlugin._tmpNode = $frag.find('icepaste')[0];
      fragment = ice.dom.extractContent($frag[0]);
      pastePlugin.handleFormattedPasteValue(fragment, true);

      assert.ok(el.find('p').length === 5
          && el.find('p:eq(0)').text() === 'First '
          && el.find('p:eq(1)').text() === 'text '
          && el.find('p:eq(4)').text() === 'paragraph.'
          , 'Blocks were pasted in correctly');


      // Test tag attribute stripping (preserve definition in setup.js: p,a[href],strong[*],em[id|class])
      el = jQuery('<div/>');
      changeEditor = getIce(el);
      // Setup the pasted content.
      el.html('<div><p class="fakeone">Some <strong id="test" class="whatever">awesome</strong> <a href="http://test.com">para</a> <em id="ha" class="nah" style="border:none">text</em>.</p></div>');
      pastePlugin = changeEditor.pluginsManager.plugins['IceCopyPastePlugin'];
      // Setup the original body fragment with a temp node (marker for where paste is handled).
      $frag = jQuery('<div>\
        <p><icepaste/>Paragraph.</p>\
      </div>');
      pastePlugin._tmpNode = $frag.find('icepaste')[0];
      fragment = ice.dom.extractContent($frag[0]);
      pastePlugin.handleFormattedPasteValue(fragment, true);

      assert.ok(!el.find('p:eq(1)').attr('class')
          && el.find('p:eq(1) strong').attr('id') === 'test' && el.find('p:eq(1) strong').attr('class') === 'whatever'
          && el.find('p:eq(1) a').attr('href')
          && el.find('p:eq(1) em').attr('id') === 'ha' && el.find('p:eq(1) em').attr('class') === 'nah'
          && !el.find('p:eq(1) em').attr('style')
          , 'Attributes were stripped out of pasted tags correctly');

    
      // Test tag stripping (preserve definition in setup.js: p,a[href],strong[*],em[id|class])
      el = jQuery('<div/>');
      changeEditor = getIce(el);
      // Setup the pasted content.
      el.html('<div><p>Some <strong>awesome <code>code</code></strong> <button>for</button> <em>text</em>.</p></div>');
      pastePlugin = changeEditor.pluginsManager.plugins['IceCopyPastePlugin'];
      // Setup the original body fragment with a temp node (marker for where paste is handled).
      $frag = jQuery('<div>\
        <p><icepaste/>Paragraph.</p>\
      </div>');
      pastePlugin._tmpNode = $frag.find('icepaste')[0];
      fragment = ice.dom.extractContent($frag[0]);
      pastePlugin.handleFormattedPasteValue(fragment, true);

      // The only two non-block tags left in the element body should be strong and em
      assert.ok(el.find('div, strong, b, ol, li, em').length === 2
          && el.find('p:eq(1)').text() === 'Some awesome code for text.'
          , 'Tags were stripped out correctly');

    
      // Test change tag cleaning
      el = jQuery('<div/>');
      changeEditor = getIce(el);
      // Setup the pasted content.
      el.html('<div><p>Some <span class="ins ct">insert <span class="del ct">delete</span></span> content.</p></div>');
      pastePlugin = changeEditor.pluginsManager.plugins['IceCopyPastePlugin'];
      // Setup the original body fragment with a temp node (marker for where paste is handled).
      $frag = jQuery('<div>\
        <p><icepaste/>Paragraph.</p>\
      </div>');
      pastePlugin._tmpNode = $frag.find('icepaste')[0];
      fragment = ice.dom.extractContent($frag[0]);
      pastePlugin.handleFormattedPasteValue(fragment, true);

      assert.ok(el.find('.ct').length === 0
          && el.find('p:eq(1)').text() === 'Some insert  content.'
          , 'Tracking tags were cleaned.');


    });
  });
*/
});
