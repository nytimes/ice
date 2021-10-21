$(document).ready(function() {

  QUnit.module("ice core", function() {

    QUnit.test("InlineChangeEditor.constructor", function(assert) {

      // Setup for empty element.
      el = jQuery('<div></div>');
      changeEditor = getIce(el);
      range = changeEditor.env.selection.createRange();
      range.selectNode(el[0]);

      assert.ok(el.find('p').length === 1, 'Paragraph was added to empty element.');
      assert.ok(el.find('p')[0].parentNode.parentNode === range.startContainer, 
        'Range was initialized to contain the paragraph.');
      
      // Setup for multi-user/paragraph initialization.
      var el = jQuery('<div><p>test <span class="ins cts-1" data-time="987654321" data-userid="2" data-username="Hank" data-cid="1">content</span> in paragraph one.</p><p>test <span class="del cts-2" data-time="987654321" data-userid="3" data-username="Bob" data-cid="2">content</span> in paragraph two.</p></div>');
      var changeEditor = getIce(el);
      var range = changeEditor.env.selection.createRange();

      assert.ok(changeEditor.isTracking, 'Tracking is turned on.');
      var c1 = changeEditor._changes[1], c2 = changeEditor._changes[2];
      assert.ok(c1.type === "insertType" && c1.userid === "2" && c1.username === "Hank" && c1.time === "987654321", "Insert loaded from element.");
      assert.ok(c2.type === "deleteType" && c2.userid === "3" && c2.username === "Bob" && c2.time === "987654321", "Delete loaded from element.");
      assert.ok(changeEditor.pluginsManager.plugins, 'Plugins are loaded.');
      assert.ok(changeEditor.currentUser.id === "4" && changeEditor.currentUser.name === "Ted", 'Current user is loaded.');
      var us = changeEditor._userStyles;
      assert.ok(us['2'] === 'cts-1' && us['3'] === 'cts-2', 'User styles are properly assigned.');

    });

    QUnit.test("InlineChangeEditor.placeholdDeletes", function(assert) {
      var el = jQuery('<div>\
        <p>test <span class="del cts-1" data-userid="1" data-cid="1">content</span> in paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);
      changeEditor.placeholdDeletes();

      assert.ok(el.find('p:eq(0)').text() === 'test  in paragraph one.'
        && el.find('p:eq(0) tempdel').attr('data-allocation') === '0', 'Delete in paragraph has a placeholder.');
      assert.ok(el.find('p:eq(1)').text() === 'test  paragraph two.'
        && el.find('p:eq(1) tempdel').attr('data-allocation') === '1', 'Nested delete has a placeholder');
    });

    QUnit.test("InlineChangeEditor.revertDeletePlaceholders", function(assert) {
      var html = '<p>test <span class="del cts-1" data-userid="1" data-cid="1">content</span> in paragraph one.</p><p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>';
      var el = jQuery('<div>' + html + '</div>');
      var changeEditor = getIce(el);
      changeEditor.placeholdDeletes();
      changeEditor.revertDeletePlaceholders();

      assert.ok(el.html() === html, 'Delete placeholders were reverted properly.');
    });
    
    QUnit.test("InlineChangeEditor.getCleanContent", function(assert) {
      // Make sure track changes tags are cleaned properly.
      var el = jQuery('<div>\
        <p>test <span class="ins cts-1" data-userid="1" data-cid="1">content</span> in paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);
      var content = changeEditor.getCleanContent();
      
      assert.ok(jQuery('<div>' + content + '</div>').find('.ins, .del').length === 0, 'Inserts and Deletes were stripped from content body');
      assert.ok(jQuery('<div>' + content + '</div>').text() === 'test content in paragraph one.test  paragraph two.', 'Inserts and deletes were removed correctly');
    });

    QUnit.test("InlineChangeEditor.acceptAll", function(assert) {
      var el = jQuery('<div>\
        <p>test <span class="ins cts-1" data-userid="1" data-cid="1">content<span class="ins cts-1" data-userid="1" data-cid="4"> in</span></span> paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);
      changeEditor.acceptAll();

      assert.ok(jQuery(el).find('.ins,.del').length === 0, 'Inserts and deletes were not found in the content.');
      assert.ok(jQuery(el).text() === 'test content in paragraph one.test  paragraph two.', 'Deletes were removed and inserts were replaced with their inner content.');
    });
    
    QUnit.test("InlineChangeEditor.rejectAll", function(assert) {
      var el = jQuery('<div>\
        <p>test <span class="ins cts-1" data-userid="1" data-cid="1">content<span class="ins cts-2" data-userid="2" data-cid="4"> in</span></span> paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);
      changeEditor.rejectAll();
      
      assert.ok(jQuery(el).find('.ins,.del').length === 0, 'Inserts and deletes were not found in the content.');
      assert.ok(jQuery(el).text() === 'test  paragraph one.test content  paragraph two.', 'Inserts were removed and deletes were replaced with their inner content.');
    });
    
    QUnit.test("InlineChangeEditor.acceptChange", function(assert) {
      var el = jQuery('<div>\
        <p>test <span class="ins cts-1" data-userid="1" data-cid="1">content<span class="ins cts-1" data-userid="1" data-cid="4"> in</span></span> paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span><span class="del cts-2" data-userid="2" data-cid="2">batch change data-cid</span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);
      
      var range = changeEditor.env.selection.createRange();
      range.setStart(el.find('[data-cid=4]')[0], 0);
      range.collapse(true);
      changeEditor.env.selection.addRange(range);
      changeEditor.acceptChange(jQuery(el).find('[data-cid=4]'));
      changeEditor.acceptChange(jQuery(el).find('[data-cid=2]:eq(0)'));

      assert.ok(jQuery(el).find('[data-cid=4], [data-cid=2]').length === 0, 'Tracking nodes were not found in content.');
      assert.ok(jQuery(el).text() === 'test content in paragraph one.test  paragraph two.', 'Tracking nodes were accepted based on their respective tags.');
    });
    
    QUnit.test("InlineChangeEditor.rejectChange", function(assert) {
      var el = jQuery('<div>\
        <p>test <span class="ins cts-1" data-userid="1" data-cid="1">content<span class="ins cts-1" data-userid="1" data-cid="4"> in</span></span> paragraph one.</p>\
        <p>test <em><span class="del cts-2" data-userid="2" data-cid="2">content <span class="ins cts-2" data-userid="2" data-cid="3">in</span></span> paragraph</em> two.</p>\
      </div>');
      var changeEditor = getIce(el);

      var range = changeEditor.env.selection.createRange();
      range.setStart(el.find('[data-cid=4]')[0], 0);
      range.collapse(true);
      changeEditor.env.selection.addRange(range);
      changeEditor.rejectChange(jQuery(el).find('[data-cid=4]'));
      changeEditor.rejectChange(jQuery(el).find('[data-cid=2]'));

      assert.ok(jQuery(el).find('[data-cid=4], [data-cid=2]').length === 0, 'Tracking nodes were not found in content.');
      assert.ok(jQuery(el).text() === 'test content paragraph one.test content in paragraph two.', 'Tracking nodes were rejected based on their respective tags.');
    });
  });
});
