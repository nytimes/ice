$(document).ready(function() {

  QUnit.module("ice core | InlineChangeEditor.insert", function() {

    QUnit.test("inserting into a block (paragraph in this case)", function(assert) {
      // Setup for inserting into a block (paragraph in this case).
      var el = jQuery('<div>' +
          '<p>a paragraph</p>' +
        '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);
      var range = changeEditor.env.selection.createRange();
      
      // Insert at the end of a paragraph.  
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 11);
      range.collapse(true);
      changeEditor.insert('. The end.', range);
      assert.ok(el.find('.ins:eq(0)').text() === '. The end.' 
            && el.text() === 'a paragraph. The end.', 
          'Inserted at the end of a block.');

      // Insert at the middle of the paragraph.
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.insert('new ', range);
      assert.ok(el.find('.ins:eq(0)').text() === 'new ' 
            && el.text() === 'a new paragraph. The end.', 
          'Inserted in the middle of a block.');

      // Insert at the beginning of the paragraph.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.insert('At the beginning of ', range);
      assert.ok(el.find('.ins:eq(0)').text() === 'At the beginning of ' 
            && el.text() === 'At the beginning of a new paragraph. The end.', 
          'Inserted at the beginning of a block.');
    });

    QUnit.test("nested inserts", function(assert) {
      // Setup for nested inserts.
      var el = jQuery('<div>' +
          '<p>test<span class="ins cts-1" userid="2" cid="1" data-username="hank"> in 1 <span class="ins cts-2" userid="3" cid="2" data-username="eve">in 2 </span></span><span class="ins cts-3" userid="4" cid="3" data-username="James">in 3</span> done.</p>' +
        '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);
      var range = changeEditor.env.selection.createRange();
      
      // Insert into same user insert.
      range.setStart(el.find('span[cid=3]')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.find('[cid=3]').text() === 'insert 3' 
            && el.text() === 'test in 1 in 2 insert 3 done.', 
          'Inserted in same user insert.');

      // Insert into another user's insert.
      range.setStart(el.find('span[cid=1]')[0], 0);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.text() === 'test insert 1 in 2 insert 3 done.', 'Inserted in another user insert.');
      
      // Insert into nested, multi-user insert.
      range.setStart(el.find('span[cid=2]')[0], 0);
      range.moveStart('character', 2)
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.find('[cid=2]').find('.ins').text() === 'sert' 
            && el.text() === 'test insert 1 insert 2 insert 3 done.', 
          'Inserted in a mult-user insert.');
    });

    QUnit.test("inserting in deletes.", function(assert) {
      // Setup for inserting in deletes.
      var el = jQuery('<div>' +
          '<p>test <span class="del cts-1" userid="1" cid="1" data-username="hank">delete 1</span><span class="del cts-2" userid="2" cid="2" data-username="eve"> delete 2<span class="del cts-3" userid="3" cid="3" data-username="james"> delete 3</span> delete 2.</span> The end.</p>' +
        '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete
      range.setStartAfter(el.find('span[cid=3]')[0], 0);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.find('.ins').text() === ' new insert.' 
            && el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
          'Tried to insert in a delete.');
      el.find('.ins').remove();  // cleanup the dom

      // Try to insert in a nested delete
      range.setStart(el.find('span[cid=3]')[0], 0);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.find('.ins').text() === ' new insert.' 
            && el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
          'Tried to insert in a nested delete.');
      el.find('.ins').remove();  // cleanup the dom

      // Try to insert in a delete that has an adjacent delete
      range.setStart(el.find('span[cid=1]')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.find('.ins').text() === ' new insert.' 
            && el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
          'Tried to insert in a delete that has an adjacent delete.');
    });

    QUnit.test("inserting into a block containing one delete", function(assert) {
      // Setup for inserting into a block containing one delete.
      el = jQuery('<div>' +
          '<p><span class="del cts-1" userid="1" cid="1" data-username="hank">delete</span></p><p> text</p>' +
        '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete consuming whole paragraph
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' test', range);
      assert.ok(el.text() === 'delete test text' 
          && el.find('.ins').parent().is('p'),
        'Tried to insert in a delete that consumes the inside of a block.');
    });

    QUnit.test("inserting into a block containing one delete and no other blocks", function(assert) {
      // Setup for inserting into a block containing one delete and no other blocks.
      var el = jQuery('<div>' +
          '<p><span class="del cts-1" userid="1" cid="1" data-username="hank">del</span><span class="del cts-2" userid="1" cid="2" data-username="eve">ete</span></p>' +
        '</div>');

      var changeEditor = getIce(el);
      $("body").append(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete consuming paragraph and no other blocks
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' test', range);
      assert.ok(el.text() === 'delete test' 
          && el.find('.ins').parent().is('p'), 
        'Tried to insert in a delete that consumes the inside of a block with no following blocks.');
    });

    QUnit.test("inserting a space into a .del region", function(assert) {
      // Setup for inserting a space into a .del region.
      var el = jQuery('<div>' +
          '<p>The placid sliver of <span class="del cts-3" data-cid="4" data-userid="11">Long</span> Island that F. Scott Fitzgerald immortalized in "The Great Gatsby" as West Egg and East Egg seems almost to have shrugged off the recession.</p>' +
          '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);

      var range = changeEditor.env.selection.createRange();

      range.setStart(el.find('span.del')[0], 1);
      range.collapse(true);
      changeEditor.insert(" ", range);
      assert.ok(el.find(".del").text() === "Long"
          && el.find(".ins").length === 1
          && el.find(".ins").text() === " ",
          "Pressed spacebar from inside delete region.");
      
      
      // Setup for inserting a space into a .del region, with track changes hidden.
      el = jQuery('<div>' +
          '<p>The placid sliver of <span class="del cts-3" data-cid="4" data-userid="11">Long</span> Island that F. Scott Fitzgerald immortalized in "The Great Gatsby" as West Egg and East Egg seems almost to have shrugged off the recession.</p>' +
          '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      el.find(".del").css({display:"none"});

      range.setStart(el.find('span.del')[0], 1);
      range.collapse(true);
      changeEditor.insert(" ", range);
      assert.ok(el.find(".del").text() === "Long"
          && el.find(".ins").length === 1
          && el.find(".ins").text() === " ",
          "Pressed spacebar from inside delete region.");
    });
  });
});
