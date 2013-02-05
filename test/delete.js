$(document).ready(function() {

	module("ice core");

	test("InlineChangeEditor.deleteContents", function() {
		
		// Setup for deleting left, through different user insert
		var el = jQuery('<div>' +
				'<p>a <em>left<span class="ins cts-1" userid="1" cid="1">ist</span></em> paragraph</p>' +
			'</div>');
		var changeEditor = getIce(el);
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

		ok(el.find('.del:eq(3)').text() === ' p'
				&& el.find('.del:eq(2)').text() === 'ist'
				&& el.find('.del:eq(1)').text() === 'left'
				&& el.find('.del:eq(0)').text() === 'a ', 
			'Deleted left through different user insert.');

		// Setup for deleting right, through different user insert
		el = jQuery('<div>' +
				'<p>a <em>right<span class="ins cts-1" userid="1" cid="1">ist</span></em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);

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

		ok(el.find('.del').length === 4
				&& el.find('em > .ins > .del').text() === 'ist', 
			'Deleted right through different user insert.');

		// Setup for deleting left, through same user insert
		el = jQuery('<div>' +
				'<p>a <em><span class="ins cts-1" userid="4" cid="1">left</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.text() === 'a ist paragraph'
				&& el.find('.del').length === 3, 
			'Deleted left through same user insert.');
		
		// Setup for deleting right, through same user insert
		el = jQuery('<div>' +
				'<p>a <em><span class="ins cts-1" userid="4" cid="1">right</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.text() === 'a ist paragraph'
				&& el.find('.del').length === 3, 
			'Deleted right through same user insert.');

		// Setup for deleting left, through different user delete
		el = jQuery('<div>' +
				'<p>a<em> <span class="del cts-1" userid="1" cid="1">left</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.find('.del').length === 5
				&& el.find('em').find('.del:eq(0)').text() === ' '
				&& el.find('em').find('.del:eq(1)').text() === 'left'
				&& el.find('em').find('.del:eq(2)').text() === 'ist', 
			'Deleted left through different user delete.');

		// Setup for deleting right, through different user delete
		el = jQuery('<div>' +
				'<p>a <em><span class="del cts-1" userid="1" cid="1">right</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);

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

		ok(el.find('.del').length === 4
				&& el.find('em').find('.del:eq(0)').text() === 'right'
				&& el.find('em').find('.del:eq(1)').text() === 'ist',
			'Deleted right through different user delete.');

			// Setup for deleting left, through same user delete
		el = jQuery('<div>' +
				'<p>a<em> <span class="del cts-1" userid="4" cid="1">left</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.find('.del').length === 3
				&& el.find('em').find('.del:eq(0)').text() === ' leftist',
			'Deleted left through same user delete.');
		
		// Setup for deleting right, through same user delete
		el = jQuery('<div>' +
				'<p>a <em><span class="del cts-1" userid="4" cid="1">right</span>ist</em> paragraph</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.find('.del').length === 3
				&& el.find('em').find('.del').text() === 'rightist',
			'Deleted right through same user delete.');

		// Setup for deleting left, through blocks
		el = jQuery('<div>' +
				'<p>paragraph 1</p><p>paragraph 2</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete left through block.
		range.setStart(el.find('p:eq(1)')[0], 0);
		range.moveStart('character', 2);
		range.collapse(true);
		changeEditor.deleteContents(false, range);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);

		ok(el.find('p').length === 1
				&& el.find('.del:eq(0)').text() === '1pa',
			'Deleted left through blocks.');

		// Setup for deleting right, through blocks
		el = jQuery('<div>' +
				'<p>paragraph 1</p><p>paragraph 2</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete right through block.
		range.setStart(el.find('p:eq(0)')[0], 0);
		range.moveStart('character', 9);
		range.collapse(true);
		changeEditor.deleteContents(true, range);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		
		ok(el.find('p').length === 1
				&& el.find('.del').length === 1
				&& el.find('.del:eq(0)').text() === ' 1pa',
			'Deleted right through blocks.');

		// Setup for deleting left, through empty blocks
		el = jQuery('<div>' +
				'<p><em>paragraph 1</em></p><p></p><p></p><p>paragraph 3</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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

		ok(el.find('p').length === 1
				&& el.find('.del:eq(0)').text() === '1'
				&& el.find('.del:eq(1)').text() === 'pa',
			'Deleted left through empty blocks.');

		// Setup for deleting right, through empty blocks
		el = jQuery('<div>' +
				'<p>paragraph 1</p><p></p><p></p><p><em>paragraph</em> 2</p>' +
			'</div>');
		changeEditor = getIce(el);
		
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
		
		ok(el.find('p').length === 1
				&& el.find('.del').length === 2
				&& el.find('.del:eq(0)').text() === ' 1'
				&& el.find('.del:eq(1)').text() === 'pa',
			'Deleted right through empty blocks.');

		// Setup for deleting left through adjacent, different-user deletes
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" cid="1" userid="1">delete1</span><span class="del cts-1" cid="2" userid="1">delete2</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete left through adjacent, different-user deletes
		range.setStartAfter(el.find('span:eq(1)')[0]);
		range.moveStart('character', 2);
		range.collapse(true);
		changeEditor.deleteContents(false, range);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);		

		ok(el.find('.del:eq(0)').text() === 't ' && el.find('.del:eq(3)').text() === ' t',
			'Deleted left through adjacent, different-user deletes.');

		// Setup for deleting right through adjacent, different-user deletes
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" cid="1" userid="1">delete1</span><span class="del cts-1" cid="2" userid="1">delete2</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete right through adjacent, different-user deletes
		range.setStart(el.find('p:eq(0)')[0], 0);
		range.moveStart('character', 3);
		range.collapse(true);
		changeEditor.deleteContents(true, range);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		
		ok(el.find('.del:eq(0)').text() === 't ' && el.find('.del:eq(3)').text() === ' t',
			'Deleted right through adjacent, different-user deletes.');

		// Setup for deleting left through adjacent, same-user deletes
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" cid="1" userid="4">delete1</span><span class="del cts-1" cid="2" userid="4">delete2</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete left through adjacent, same-user deletes
		range.setStartAfter(el.find('span:eq(1)')[0]);
		range.moveStart('character', 2);
		range.collapse(true);
		changeEditor.deleteContents(false, range);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);
		changeEditor.deleteContents(false);

		
		ok(el.find('.del:eq(0)').text() === 't delete1'
				&& el.find('.del:eq(1)').text() === 'delete2 t',
			'Delete left through adjacent, same-user deletes.');

		// Setup for deleting right through adjacent, same-user deletes
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" cid="1" userid="4">delete1</span><span class="del cts-1" cid="2" userid="4">delete2</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete right through adjacent, same-user deletes
		range.setStart(el.find('p:eq(0)')[0], 0);
		range.moveStart('character', 3);
		range.collapse(true);
		changeEditor.deleteContents(true, range);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);
		changeEditor.deleteContents(true);

		ok(el.find('.del:eq(1)').text() === 'delete2 t' && el.find('.del:eq(0)').text() === 't delete1',
			'Deleted right through adjacent, same-user deletes.');

	
		// Setup for deleting selection
		el = jQuery('<div>' +
				'<p>test delete test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 5);
		range.collapse(true);
		range.moveEnd('character', 6);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').text() === 'delete', 'Deleted a selection.');
	
		// Setup for deleting selection that ends in a nested tag
		el = jQuery('<div>' +
				'<p>test <em>delete</em> test</p>' +
			'</div>');
		changeEditor = getIce(el);

		// Delete selection
		range.setStart(el.find('p')[0], 0);
		range.collapse(true);
		range.moveEnd('character', 7);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').length === 2
				&& el.find('.del:eq(1)').text() === 'de', 
			'Deleted a selection that ends in a nested tag.');
	
		// Setup for deleting selection that begins in a nested tag
		el = jQuery('<div>' +
				'<p>test <em><b>del</b>ete</em> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('b')[0], 0);
		range.moveStart('character', 1);
		range.collapse(true);
		range.moveEnd('character', 7);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').length === 3
				&& el.find('.del:eq(0)').text() === 'el' 
				&& el.find('.del:eq(1)').text() === 'ete' 
				&& el.find('.del:eq(2)').text() === ' t', 
			'Deleted a selection that begins in a nested tag.');

		// Setup for deleting selection that spans through blocks
		el = jQuery('<div>' +
				'<p>paragraph 1</p><p></p><p>paragraph 3</p><p><em>pa</em>ragraph 4</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 9);
		range.collapse(true);
		range.moveEnd('character', 15);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').length === 3
				&& el.find('.del:eq(0)').text() === ' 1' 
				&& el.find('.del:eq(1)').text() === 'paragraph 3' 
				&& el.find('.del:eq(2)').text() === 'pa',
			'Deleted a selection that spans through blocks.');
	
		// Setup for deleting selection that ends in a delete tag
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" userid="1" cid="1">delete</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('p')[0], 0);
		range.collapse(true);
		range.moveEnd('character', 7);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').length === 2
				&& el.find('.del:eq(0)').text() === 'test ' 
				&& el.find('.del:eq(1)').text() === 'delete', 
			'Deleted a selection that ends in a delete tag.');

		// Setup for deleting selection that begins in a delete tag
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" userid="1" cid="1"><b>del</b>ete</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('b')[0], 0);
		range.moveStart('character', 1);
		range.collapse(true);
		range.moveEnd('character', 7);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del').length === 2
				&& el.find('.del:eq(0)').text() === 'delete' 
				&& el.find('.del:eq(1)').text() === ' t', 
			'Deleted a selection that begins in a delete tag.');

		// Setup for deleting selection with nested inner nodes
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" userid="1" cid="1"><b>del</b>ete</span><span class="ins cts-2" userid="1" cid="2"> small</span> test</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Delete selection
		range.setStart(el.find('p')[0], 0);
		range.collapse(true);
		range.moveEnd('character', 22);
		changeEditor.deleteContents(true, range);
		
		ok(el.find('.del  ').length === 4
				&& el.find('.del:eq(0)').text() === 'test ' 
				&& el.find('.del:eq(1)').text() === 'delete'
				&& el.find('.del:eq(2)').text() === ' small'
				&& el.find('.del:eq(3)').text() === ' test',
			'Deleted a selection with nested inner nodes.');


		// <div><p>|text</p><p>text <span class="del cts-1" userid="4" cid="1">same user delete</span> text</p><p>text|</p></div>
		//         |                                                                                                  |
		//         A                                                                                                  B
		// Delete the selection from A to B and expect that all inner paragraph
		// nodes are deleted and the existing user delete is merged with new delete nodes.
		el = jQuery('<div><p>text</p><p>text <span class="del cts-1" userid="4" cid="1">same user delete</span> text</p><p>text</p></div>');
		changeEditor = getIce(el);

		range.setStart(el.find('p')[0], 0);
		range.setEnd(el.find('p:eq(2)')[0].childNodes[0], 0);
		range.moveEnd('character', 4);

		changeEditor.deleteContents(true, range);

		equal(el.find('.del').length, 3);
		equal(el.text(), 'texttext same user delete texttext');
	});
});
