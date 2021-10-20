$(document).ready(function() {

  QUnit.module("ice core", function() {

    QUnit.test("InlineChangeEditor.deleteContents", function(assert) {

      // Setup for deleting left, through different user insert
      var el = jQuery('<div id="test-1">' +
          '<p>a <em>left<span class="ins cts-1" data-userid="1" data-cid="1">ist</span></em> paragraph</p>' +
        '</div>');
      var changeEditor = getIce(el);
      $("body").append(el);
      var range = changeEditor.env.selection.createRange();

      // Delete left through different user insert.
      range.setStartAfter(el.find('em')[0]);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del:eq(3)').text() === ' p'
          && el.find('.del:eq(2)').text() === 'ist'
          && el.find('.del:eq(1)').text() === 'left'
          && el.find('.del:eq(0)').text() === 'a ', 
        'Deleted left through different user insert.');


      // Setup for deleting right, through different user insert
      el = jQuery('<div id="test-2">' +
          '<p>a <em>right<span class="ins cts-1" data-userid="1" data-cid="1">ist</span></em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through different user insert.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 4
          && el.find('em > .ins > .del').text() === 'ist', 
        'Deleted right through different user insert.');


      // Setup for deleting left, through different user delete and insert
      el = jQuery('<div id="test-3">' +
          '<p>a <em>l<span class="ins cts-1" data-userid="1" data-cid="1">ef</span><span class="del cts-1" data-userid="1" data-cid="1">ti</span>st</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through different user insert and delete.
      range.setStartAfter(el.find('em')[0]);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 6
          && el.find('em > .ins > .del').text() === 'ef', 
        'Deleted left through different user insert and delete.');


      // Setup for deleting right, through different user delete and insert
      el = jQuery('<div id="test-4">' +
          '<p>a <em>r<span class="ins cts-1" data-userid="1" data-cid="1">ig</span><span class="del cts-1" data-userid="1" data-cid="1">hte</span>st</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through different user insert and delete.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 6
          && el.find('em > .ins > .del').text() === 'ig', 
        'Deleted right through different user insert and delete.');


      // Setup for deleting left, through same user insert
      el = jQuery('<div id="test-5">' +
          '<p>a <em><span class="ins cts-1" data-userid="4" data-cid="1">left</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through same user insert.
      range.setStartAfter(el.find('em')[0]);
      range.moveStart('character', 10);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.text() === 'a ist paragraph'
          && el.find('.del').length === 3, 
        'Deleted left through same user insert.');

      
      // Setup for deleting right, through same user insert
      el = jQuery('<div id="test-6">' +
          '<p>a <em><span class="ins cts-1" data-userid="4" data-cid="1">right</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete left through same user insert.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.text() === 'a ist paragraph'
          && el.find('.del').length === 3, 
        'Deleted right through same user insert.');



      // Setup for deleting left, through different user delete
      el = jQuery('<div id="test-7">' +
          '<p>a<em> <span class="del cts-1" data-userid="1" data-cid="1">left</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through different user delete.
      range.setStartAfter(el.find('em')[0]);
      range.moveStart('character', 10);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 5
          && el.find('em').find('.del:eq(0)').text() === ' '
          && el.find('em').find('.del:eq(1)').text() === 'left'
          && el.find('em').find('.del:eq(2)').text() === 'ist', 
        'Deleted left through different user delete.');


      // Setup for deleting right, through different user delete
      el = jQuery('<div id="test-8">' +
          '<p>a <em><span class="del cts-1" data-userid="1" data-cid="1">right</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through different user delete.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 4
          && el.find('em').find('.del:eq(0)').text() === 'right'
          && el.find('em').find('.del:eq(1)').text() === 'ist',
        'Deleted right through different user delete.');


    // Setup for deleting right, and then checking the cursor position afterwards
    // The cursor must be outside of (after) the .del region
      el = jQuery('<div id="test-9">' +
          '<p>a <em><span class="del cts-1" data-userid="1" data-cid="1">right</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);

    // DO NOT append to body, to simulate hidden track change
    // (Do not append el to $(body))

      // Delete right through different user delete.
      range.setStart(el.find('span.del')[0], 0);
    range.moveStart('character', 5);
      range.collapse(true);
      changeEditor.deleteContents(true, range);

    assert.ok(range.startContainer === $("em")[0]
    		&& range.startOffset === 2,
    		"Deleting right results in the cursor after the .del element");


        // Setup for deleting left, through same user delete
      el = jQuery('<div id="test-10">' +
          '<p>a<em> <span class="del cts-1" data-userid="4" data-cid="1">left</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete left through same user delete.
      range.setStartAfter(el.find('em')[0]);
      range.moveStart('character', 10);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 3
          && el.find('em').find('.del:eq(0)').text() === ' leftist',
        'Deleted left through same user delete.');
      
      // Setup for deleting right, through same user delete
      el = jQuery('<div id="test-11">' +
          '<p>a <em><span class="del cts-1" data-userid="4" data-cid="1">right</span>ist</em> paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete right through same user delete.
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 3
          && el.find('em').find('.del').text() === 'rightist',
        'Deleted right through same user delete.');

      // Setup for deleting left, through blocks
      el = jQuery('<div id="test-12">' +
          '<p>paragraph 1</p><p>paragraph 2</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through block.
      range.setStart(el.find('p:eq(1)')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

    	assert.ok(el.find('p').length === 2
    		 && el.find('.del:eq(0)').text() === '1'
    		 && el.find('.del:eq(1)').text() === 'pa',
        'Deleted left through blocks.');

      // Setup for deleting right, through blocks
      el = jQuery('<div id="test-13">' +
          '<p>paragraph 1</p><p>paragraph 2</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through block.
      range.setStart(el.find('p:eq(0)')[0], 0);
      range.moveStart('character', 9);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('p').length === 2
          && el.find('.del').length === 2
          && el.find('.del:eq(0)').text() === ' 1'
          && el.find('.del:eq(1)').text() === 'pa',
        'Deleted right through blocks.');

      // Setup for deleting left, through empty blocks
      el = jQuery('<div id="test-14">' +
          '<p><em>paragraph 1</em></p><p></p><p></p><p>paragraph 3</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through empty block.
      range.setStart(el.find('p:eq(3)')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('p').length === 2
          && el.find('.del:eq(0)').text() === '1'
          && el.find('.del:eq(1)').text() === 'pa',
        'Deleted left through empty blocks.');

      // Setup for deleting right, through empty blocks
      el = jQuery('<div id="test-15">' +
          '<p>paragraph 1</p><p></p><p></p><p><em>paragraph</em> 2</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through block.
      range.setStart(el.find('p:eq(0)')[0], 0);
      range.moveStart('character', 9);
      range.collapse(true);

      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('p').length === 2
          && el.find('.del').length === 2
          && el.find('.del:eq(0)').text() === ' 1'
          && el.find('.del:eq(1)').text() === 'pa',
        'Deleted right through empty blocks.');

      // Setup for deleting left through adjacent, different-user deletes
      el = jQuery('<div id="test-16">' +
          '<p>test <span class="del cts-1" data-cid="1" data-userid="1">delete1</span><span class="del cts-1" data-cid="2" data-userid="1">delete2</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through adjacent, different-user deletes
      range.setStartAfter(el.find('span:eq(1)')[0]);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del:eq(0)').text() === 't ' && el.find('.del:eq(3)').text() === ' t',
        'Deleted left through adjacent, different-user deletes.');

      // Setup for deleting right through adjacent, different-user deletes
      el = jQuery('<div id="test-17">' +
          '<p>test <span class="del cts-1" data-cid="1" data-userid="1">delete1</span><span class="del cts-1" data-cid="2" data-userid="1">delete2</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete right through adjacent, different-user deletes
      range.setStart(el.find('p:eq(0)')[0], 0);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      
      assert.ok(el.find('.del:eq(0)').text() === 't ' && el.find('.del:eq(3)').text() === ' t',
        'Deleted right through adjacent, different-user deletes.');

      // Setup for deleting left through adjacent, same-user deletes
      el = jQuery('<div id="test-18">' +
          '<p>test <span class="del cts-1" data-cid="1" data-userid="4">delete1</span><span class="del cts-1" data-cid="2" data-userid="4">delete2</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete left through adjacent, same-user deletes
      range.setStartAfter(el.find('span:eq(1)')[0]);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      
      assert.ok(el.find('.del:eq(0)').text() === 't delete1'
          && el.find('.del:eq(1)').text() === 'delete2 t',
        'Delete left through adjacent, same-user deletes.');

      // Setup for deleting right through adjacent, same-user deletes
      el = jQuery('<div id="test-19">' +
          '<p>test <span class="del cts-1" data-cid="1" data-userid="4">delete1</span><span class="del cts-1" data-cid="2" data-userid="4">delete2</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete right through adjacent, same-user deletes
      range.setStart(el.find('p:eq(0)')[0], 0);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del:eq(1)').text() === 'delete2 t' && el.find('.del:eq(0)').text() === 't delete1',
        'Deleted right through adjacent, same-user deletes.');

      // Setup for deleting left through paragraphs and list.
      el = jQuery('<div id="test-20">' +
          '<p>First paragraph.</p><ul><li>First item</li><li>2nd item</li><li>3rd item</li></ul><p>Next <em>pa</em>ragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete left through paragraphs and list
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 7 
        &&el.find('.del:eq(0)').text() === '.',
        'Delete left through paragraphs and list.');

      // Setup for deleting right through paragraphs and list.
      el = jQuery('<div id="test-21">' +
          '<p>First <em>paragra</em>ph.</p><ul><li>Fir<i>st it</i>em</li><li>2nd item</li><li>3rd item</li></ul><p>Next paragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete right through paragraphs and list
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 7 
        && el.find('.del:eq(6)').text() === 'Ne',
        'Delete right through paragraphs and list.');

      // Setup for deleting left through paragraphs with images.
      el = jQuery('<div id="test-22">' +
      '<p>First paragraph.<img></p><p>Next<img> <em>pa</em>ragraph</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through paragraphs with images
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 3 
        &&el.find('.del > img').length === 0 
        &&el.find('.del:eq(0)').text() === 'Next ',
        'Delete left through paragraphs with images.');

      // Setup for deleting right through paragraphss with images.
      el = jQuery('<div id="test-23">' +
          '<p>First <em>pa</em>ragraph.<img></p><p>Next<img> paragraph.</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete right through paragraphs with images
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 2 
        &&el.find('.del > img').length === 0 
        &&el.find('.del:eq(1)').text() === 'Next pa',
        'Delete right through paragraphs with images.');

      // Setup for deleting left through lists with images between paragraphs with images.
      el = jQuery('<div id="test-24">' +
      '<p>First paragraph.<img></p><ul><li><img></li><li>text<img></li></ul><p><img>Next paragraph.</p><ol><li><img></li></ol><p>Last <em>pa</em>ragraph.</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete left through lists with images between paragraphs with images
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);

      assert.ok(el.find('.del').length === 4 
        && el.find('.del > img').length == 0 
        && el.find('.del:eq(0)').text() === 'Next paragraph.',
        'Delete left through lists with images between paragraphs with images.');
      
      // Setup for deleting left through image inside different user insert.
      el = jQuery('<div id="test-25">' +
      '<p>The <span class="ins cts-1" data-userid="1" data-cid="1"><img></span> te<em>x</em>t</p>' +
              '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete left through image inside different user insert
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.collapse(true);
      changeEditor.deleteContents(false, range);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);
      changeEditor.deleteContents(false);             

      assert.ok(el.find('.del').length === 3 
              &&el.find('.ins > .del > img').length === 0 
              &&el.find('.del:eq(0)').text() === 'he ',
              'Delete left through image inside different user insert.');

      // Setup for deleting right through image inside different user insert.
      el = jQuery('<div id="test-26">' +
      '<p>T<em>h</em>e <span class="ins cts-1" data-userid="1" data-cid="1"><img></span> text</p>' +
              '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete right through through image inside different user insert
      range.setStartAfter(el.find('em:eq(0)')[0]);
      range.collapse(true);
      changeEditor.deleteContents(true, range);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);
      changeEditor.deleteContents(true);

      assert.ok(el.find('.del').length === 1 
              && el.find('.ins > .del > img').length === 0 
              && el.find('.del:eq(0)').text() === 'e  t',
              'Delete right through image inside different user insert.');

    
      // Setup for deleting selection
      el = jQuery('<div id="test-27">' +
          '<p>test delete test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 5);
      range.collapse(true);
      range.moveEnd('character', 6);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').text() === 'delete', 'Deleted a selection.');
    
      // Setup for deleting selection that ends in a nested tag
      el = jQuery('<div id="test-28">' +
          '<p>test <em>delete</em> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);

      // Delete selection
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      range.moveEnd('character', 7);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 2
          && el.find('.del:eq(1)').text() === 'de', 
        'Deleted a selection that ends in a nested tag.');
    
      // Setup for deleting selection that begins in a nested tag
      el = jQuery('<div id="test-29">' +
          '<p>test <em><b>del</b>ete</em> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('b')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      range.moveEnd('character', 7);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 3
          && el.find('.del:eq(0)').text() === 'el' 
          && el.find('.del:eq(1)').text() === 'ete' 
          && el.find('.del:eq(2)').text() === ' t', 
        'Deleted a selection that begins in a nested tag.');

      // Setup for deleting selection that spans through blocks
      el = jQuery('<div id="test-30">' +
          '<p>paragraph 1</p><p></p><p>paragraph 3</p><p><em>pa</em>ragraph 4</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('p')[0], 0);
      range.moveStart('character', 9);
      range.collapse(true);
      range.moveEnd('character', 15);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 3
          && el.find('.del:eq(0)').text() === ' 1' 
          && el.find('.del:eq(1)').text() === 'paragraph 3' 
          && el.find('.del:eq(2)').text() === 'pa',
        'Deleted a selection that spans through blocks.');
    
      // Setup for deleting selection that ends in a delete tag
      el = jQuery('<div id="test-31">' +
          '<p>test <span class="del cts-1" data-userid="1" data-cid="1">delete</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      range.moveEnd('character', 7);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 2
          && el.find('.del:eq(0)').text() === 'test ' 
          && el.find('.del:eq(1)').text() === 'delete', 
        'Deleted a selection that ends in a delete tag.');

      // Setup for deleting selection that begins in a delete tag
      el = jQuery('<div id="test-32">' +
          '<p>test <span class="del cts-1" data-userid="1" data-cid="1"><b>del</b>ete</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('b')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      range.moveEnd('character', 7);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 2
          && el.find('.del:eq(0)').text() === 'delete' 
          && el.find('.del:eq(1)').text() === ' t', 
        'Deleted a selection that begins in a delete tag.');

      // Setup for deleting selection with nested inner nodes
      el = jQuery('<div id="test-33">' +
          '<p>test <span class="del cts-1" data-userid="1" data-cid="1"><b>del</b>ete</span><span class="ins cts-2" data-userid="1" data-cid="2"> small</span> test</p>' +
        '</div>');
      changeEditor = getIce(el);
      $("body").append(el);
      
      // Delete selection
      range.setStart(el.find('p')[0], 0);
      range.collapse(true);
      range.moveEnd('character', 22);
      changeEditor.deleteContents(true, range);
      
      assert.ok(el.find('.del').length === 4
    		 && el.find('.ins').length === 1
    		 && el.find('.del:eq(0)').text() === 'test ' 
    		 && el.find('.del:eq(1)').text() === 'delete'
    		 && el.find('.del:eq(2)').text() === ' small'
    		 && el.find('.del:eq(3)').text() === ' test',
        'Deleted a selection with nested inner nodes.');


      // <div><p>|text</p><p>text <span class="del cts-1" data-userid="4" data-cid="1">same user delete</span> text</p><p>text|</p></div>
      //         |                                                                                                  |
      //         A                                                                                                  B
      // Delete the selection from A to B and expect that all inner paragraph
      // nodes are deleted and the existing user delete is merged with new delete nodes.
      el = jQuery('<div id="test-34-35"><p>text</p><p>text <span class="del cts-1" data-userid="4" data-cid="1">same user delete</span> text</p><p>text</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p')[0], 0);
      range.setEnd(el.find('p:eq(2)')[0].childNodes[0], 0);
      range.moveEnd('character', 4);

      changeEditor.deleteContents(true, range);

      assert.equal(el.find('.del').length, 3);
      assert.equal(el.text(), 'texttext same user delete texttext');


      // <div><p>text|</p><img><p>second</p></div>
      //             |
      //             A
      // Delete right from A and expect the img to be deleted leaving the cursor at A
      el = jQuery('<div id="test-36-37"><p>text</p><img><p>second</p></div>');

      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p')[0].childNodes[0], 4);

      changeEditor.deleteContents(true, range);

      assert.equal(range.startContainer, el.find('p:eq(0)')[0].childNodes[0]);
      assert.equal(range.startOffset, 4);


      // <div><p>text</p><img><p>|second</p></div>
      //                         |
      //                         A
      // Delete left from A and expect the img to be deleted leaving the cursor at A
      el = jQuery('<div id="test-38-40"><p>text</p><img><p>second</p></div>');

      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(1)')[0].childNodes[0], 0);

      changeEditor.deleteContents(false, range);

      assert.ok(!el.find('img')[0]);
      assert.equal(range.startContainer, el.find('p:eq(1)')[0].childNodes[0]);
      assert.equal(range.startOffset, 0);


      // <div><p>text|</p><p class="ice-avoid">avoided</p><p>text</p></div>
      //             |
      //             A
      // Delete right from A and expect the cursor to stay in place.
      el = jQuery('<div id="test-41-43"><p>text</p><p class="ice-avoid">avoided</p><p>text</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p')[0].childNodes[0], 4);

      changeEditor.deleteContents(true, range);

      assert.ok(el.find('p.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p:eq(0)')[0].childNodes[0]);
      assert.equal(range.startOffset, 4);


      // <div><p>text</p><p class="ice-avoid">avoided</p><p>|second</p></div>
      //                                                    |
      //                                                    A
      // Delete left from A and expect the cursor to stay in place.
      el = jQuery('<div id="test-44-46"><p>text</p><p class="ice-avoid">avoided</p><p>second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(2)')[0].childNodes[0], 0);

      changeEditor.deleteContents(false, range);

      assert.ok(el.find('p.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p:eq(2)')[0].childNodes[0]);
      assert.equal(range.startOffset, 0);


      // <div><p>text|</p><img class="ice-avoid"><p>second</p></div>
      //             |
      //             A
      // Delete right from A and expect the cursor to stay put
      // since a void element is the next container.
      el = jQuery('<div id="test-47-49"><p>text</p><img class="ice-avoid"><p>second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(0)')[0].childNodes[0], 4);
      changeEditor.deleteContents(true, range);

      assert.ok(!el.find('img.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p:eq(0)')[0].childNodes[0]);
      assert.equal(range.startOffset, 4);



      // <div><p>text</p><img class="ice-avoid"><p>|second</p></div>
      //                                           |
      //                                           A
      // Delete left from A and expect the cursor to stay put
      // since a void element is the previous container.
      el = jQuery('<div id="test-50-52"><p>text</p><img class="ice-avoid"><p>second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(1)')[0].childNodes[0], 0);

      changeEditor.deleteContents(false, range);

      assert.ok(!el.find('img.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p:eq(1)')[0].childNodes[0]);
      assert.equal(range.startOffset, 0);

      // <div><p>text|<img class="ice-avoid">second</p></div>
      //             |
      //             A
      // Delete right from A and expect the cursor to stay put
      // since a void element is the next container.
      el = jQuery('<div id="test-53-55"><p>text<img class="ice-avoid">second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(0)')[0].childNodes[0], 4);
      changeEditor.deleteContents(true, range);
      assert.ok(!el.find('img.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p:eq(0)')[0].childNodes[0]);
      assert.equal(range.startOffset, 4);


      // <div><p>text<img class="ice-avoid">|second</p></div>
      //                                    |
      //                                    A
      // Delete left from A and expect the cursor to stay put
      // since a void element is the previous container.
      el = jQuery('<div id="test-56-58"><p>text<img class="ice-avoid">second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStartAfter(el.find('img')[0]);

      changeEditor.deleteContents(false, range);

      assert.ok(!el.find('img.ice-avoid')[0]);
      assert.equal(range.startContainer, el.find('p')[0]);
      assert.equal(range.startOffset, 2);


      // <div><p>text|<span class="ice-avoid">avoid</span>second</p></div>
      //             |
      //             A
      // Delete right from A and expect the cursor to stay put
      // since a void element is the next container.
      el = jQuery('<div id="test-59-60"><p>text<span class="ice-avoid">avoid</span>second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('p:eq(0)')[0].childNodes[0], 4);
      changeEditor.deleteContents(true, range);

      assert.equal(range.startContainer, el.find('p:eq(0)')[0].childNodes[0]);
      assert.equal(range.startOffset, 4);


      // <div><p>text<span class="ice-avoid">avoid</span>|second</p></div>
      //                                                 |
      //                                                 A
      // Delete left from A and expect the cursor to stay put
      // since a void element is the previous container.
      el = jQuery('<div id="test-61-62"><p>text<span class="ice-avoid">avoid</span>|second</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStartAfter(el.find('span')[0]);

      changeEditor.deleteContents(false, range);

      assert.equal(range.startContainer, el.find('p')[0]);
      assert.equal(range.startOffset, 2);


      // <div><p><span class="ins" data-cid="66" data-userid="4">|text|</span></p></div>
      //                                               |    |
      //                                               A    B
      // Delete the selection A-B in the same user insert
      // and expect that the text is removed.
      el = jQuery('<div id="test-63"><p><span class="ins cts-1" data-cid="66" data-userid="4">text</span></p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('span')[0].childNodes[0], 0);
      range.setEnd(el.find('span')[0].childNodes[0], 4);

      changeEditor.deleteContents(false, range);

      assert.equal(el.find('span').text(), '');


      // <div><p>|<em><span class="ins" data-cid="66" data-userid="4">text</span></em>|</p></div>
      //         |                                                          |
      //         A                                                          B
      // Delete the selection A-B with a nested same user
      // insert and expect that the insert is removed.
      el = jQuery('<div id="test-64-65"><p><em><span class="ins cts-1" data-cid="66" data-userid="4">text</span></em></p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStartBefore(el.find('em')[0]);
      range.setEndAfter(el.find('em')[0]);

      changeEditor.deleteContents(false, range);

      assert.equal(el.find('span').length, 0);


      // <div><p><em><span class="ins" data-cid="66" data-userid="4">te|xt</span>text</em>te|xt</p></div>
      //                                                     |                    |
      //                                                     A                    B
      // Delete the selection A-B in a nested same user insert and
      // expect same user insert to be removed, not deleted.
      el = jQuery('<div id="test-65-66"><p><em><span class="ins cts-1" data-cid="66" data-userid="4">text</span>text</em>text</p></div>');
      changeEditor = getIce(el);
      $("body").append(el);

      range.setStart(el.find('span')[0].childNodes[0], 2);
      range.setEnd(el.find('p')[0].childNodes[1], 2);
      changeEditor.deleteContents(false, range);

      assert.equal(el.text(), 'tetexttext');
      assert.equal(el.find('.del').length, 2);
    });
  });
});
