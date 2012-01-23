$(document).ready(function() {

	module("ice core");

	test("InlineChangeEditor.insert", function() {

		// Setup for inserting into a block (paragraph in this case).
		var el = jQuery('<div>' +
				'<p>a paragraph</p>' +
			'</div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();
		
		// Insert at the end of a paragraph.	
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 11);
		range.collapse(true);
		changeEditor.insert('. The end.', range);
		ok(el.find('.ins:eq(0)').text() === '. The end.' 
					&& el.text() === 'a paragraph. The end.', 
				'Inserted at the end of a block.');

		// Insert at the middle of the paragraph.
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 2);
		range.collapse(true);
		changeEditor.insert('new ', range);
		ok(el.find('.ins:eq(0)').text() === 'new ' 
					&& el.text() === 'a new paragraph. The end.', 
				'Inserted in the middle of a block.');

		// Insert at the beginning of the paragraph.
		range.setStart(el.find('p')[0], 0);
		range.collapse(true);
		changeEditor.insert('At the beginning of ', range);
		ok(el.find('.ins:eq(0)').text() === 'At the beginning of ' 
					&& el.text() === 'At the beginning of a new paragraph. The end.', 
				'Inserted at the beginning of a block.');

		// Setup for nested inserts.
		el = jQuery('<div>' +
				'<p>test<span class="ins cts-1" userid="2" cid="1"> in 1 <span class="ins cts-2" userid="3" cid="2">in 2 </span></span><span class="ins cts-3" userid="4" cid="3">in 3</span> done.</p>' +
			'</div>');
		changeEditor = getIce(el);
		
		// Insert into same user insert.
		range.setStart(el.find('span[cid=3]')[0], 0);
		range.moveStart('character', 2);
		range.collapse(true);
		changeEditor.insert('sert', range);
		ok(el.find('[cid=3]').text() === 'insert 3' 
					&& el.text() === 'test in 1 in 2 insert 3 done.', 
				'Inserted in same user insert.');

		// Insert into another user's insert.
		range.setStart(el.find('span[cid=1]')[0], 0);
		range.moveStart('character', 3);
		range.collapse(true);
		changeEditor.insert('sert', range);
		ok(el.text() === 'test insert 1 in 2 insert 3 done.', 'Inserted in another user insert.');
		
		// Insert into nested, multi-user insert.
		range.setStart(el.find('span[cid=2]')[0], 0);
		range.moveStart('character', 2)
		range.collapse(true);
		changeEditor.insert('sert', range);
		ok(el.find('[cid=2]').find('.ins').text() === 'sert' 
					&& el.text() === 'test insert 1 insert 2 insert 3 done.', 
				'Inserted in a mult-user insert.');
		
		// Setup for inserting in deletes.
		el = jQuery('<div>' +
				'<p>test <span class="del cts-1" userid="1" cid="1">delete 1</span><span class="del cts-2" userid="2" cid="2"> delete 2<span class="del cts-3" userid="3" cid="3"> delete 3</span> delete 2.</span> The end.</p>' +
			'</div>');
		changeEditor = getIce(el);

		// Try to insert in a delete
		range.setStartAfter(el.find('span[cid=3]')[0], 0);
		range.collapse(true);
		changeEditor.insert(' new insert.', range);
		ok(el.find('.ins').text() === ' new insert.' 
					&& el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
				'Tried to insert in a delete.');
		el.find('.ins').remove();  // cleanup the dom

		// Try to insert in a nested delete
		range.setStart(el.find('span[cid=3]')[0], 0);
		range.collapse(true);
		changeEditor.insert(' new insert.', range);
		ok(el.find('.ins').text() === ' new insert.' 
					&& el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
				'Tried to insert in a nested delete.');
		el.find('.ins').remove();  // cleanup the dom

		// Try to insert in a delete that has an adjacent delete
		range.setStart(el.find('span[cid=1]')[0], 0);
		range.moveStart('character', 1);
		range.collapse(true);
		changeEditor.insert(' new insert.', range);
		ok(el.find('.ins').text() === ' new insert.' 
					&& el.text() === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.', 
				'Tried to insert in a delete that has an adjacent delete.');

		// Setup for inserting into a block containing one delete.
		el = jQuery('<div>' +
				'<p><span class="del cts-1" userid="1" cid="1">delete</span></p><p> text</p>' +
			'</div>');
		changeEditor = getIce(el);
				
		// Try to insert in a delete consuming whole paragraph
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 1);
		range.collapse(true);
		changeEditor.insert(' test', range);
		ok(el.text() === 'delete test text' 
				&& el.find('.ins').parent().is('p'),
			'Tried to insert in a delete that consumes the inside of a block.');

		// Setup for inserting into a block containing one delete and no other blocks.
		el = jQuery('<div>' +
				'<p><span class="del cts-1" userid="1" cid="1">del</span><span class="del cts-2" userid="1" cid="2">ete</span></p>' +
			'</div>');
		changeEditor = getIce(el);
				
		// Try to insert in a delete consuming paragraph and no other blocks
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 1);
		range.collapse(true);
		changeEditor.insert(' test', range);
		ok(el.text() === 'delete test' 
				&& el.find('.ins').parent().is('p'), 
			'Tried to insert in a delete that consumes the inside of a block with no following blocks.');
	});

});
