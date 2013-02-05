$(document).ready(function() {

	module("range/rangy extensions");

	test("range.moveStart - move 1 character to the left", function() {
		// <div><p><span>a paragrap|h</span>|</p></div>
		//                         |        |
		//                         A        B
		// go from B to A
		var el = jQuery('<div><p><span>a paragraph</span></p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();
		
		range.setStart(el.find('p')[0], 0);
		range.collapse(false);
		range.moveStart('character', -1);

		equal(range.startContainer, el.find('span')[0].childNodes[0]);
		equal(range.startOffset, 10);
	});

	test("range.moveStart - move 1 character to the right", function() {
		// <div><p>|<span>a| paragraph</span></p></div>
		//         |       |
		//         A       B
		// go from A to B
		var el = jQuery('<div><p><span>a paragraph</span></p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();
		
		range.setStart(el.find('p')[0], 0);
		range.moveStart('character', 1);

		equal(range.startContainer, el.find('span')[0].childNodes[0]);
		equal(range.startOffset, 1);
	});

	test("range.moveStart - move 15 characters to the left", function() {
		// <div><p>te|st<span>a paragraph</span>te|st</p></div>
		//           |                            |
		//           A                            B
		// go from B to A
		var el = jQuery('<div><p>test<span>a paragraph</span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p')[0].childNodes[2], 2);
		range.moveStart('character', -15);

		equal(range.startContainer, el.find('p')[0].childNodes[0]);
		equal(range.startOffset, 2);
	});

	test("range.moveStart - move 15 characters to the right", function() {
		// <div><p>te|st<span>a paragraph</span>te|st</p></div>
		//           |                            |
		//           A                            B
		// go from A to B
		var el = jQuery('<div><p>test<span>a paragraph</span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p')[0].childNodes[0], 2);
		range.moveStart('character', 15);

		equal(range.startContainer, el.find('p')[0].childNodes[2]);
		equal(range.startOffset, 2);
	});

	test("range.moveStart - move 6 characters to the left", function() {
		// <div><p>test<span>a parag|raph</span>te|st</p></div>
		//                          |             |
		//                          A             B
		// go from B to A
		var el = jQuery('<div><p>test<span>a paragraph</span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p')[0].childNodes[2], 2);
		range.moveStart('character', -6);

		equal(range.startContainer, el.find('span')[0].childNodes[0]);
		equal(range.startOffset, 7);
	});

	test("range.moveStart - move 6 characters to the right", function() {
		// <div><p>test<span>a parag|raph</span>te|st</p></div>
		//                          |             |
		//                          A             B
		// go from A to B
		var el = jQuery('<div><p>test<span>a paragraph</span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p')[0].childNodes[1].childNodes[0], 7);
		range.moveStart('character', 6);

		equal(range.startContainer, el.find('p')[0].childNodes[2]);
		equal(range.startOffset, 2);
	});

	test("range.moveStart - move 6 characters to the left", function() {
		// <div><p>test<span><em>a parag|raph</em></span>te|st</p></div>
		//                              |                  |
		//                              A                  B
		// go from B to A
		var el = jQuery('<div><p>test<span><em>a paragraph</em></span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p')[0].childNodes[2], 2);
		range.moveStart('character', -6);

		equal(range.startContainer, el.find('span')[0].childNodes[0].childNodes[0]);
		equal(range.startOffset, 7);
	});

	test("range.moveStart - move 19 characters to the right", function() {
		// <div><p>test<span><em>a parag|raph</em></span>test</p><p></p><p>test<span><em>a parag|raph</em></span>test</p></div>
		//                              |                                                       |
		//                              A                                                       B
		// go from A to B
		var el = jQuery('<div><p>test<span><em>a paragraph</em></span>test</p><p></p><p>test<span><em>a paragraph</em></span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p:eq(0) em')[0].childNodes[0], 7);
		range.moveStart('character', 19);

		equal(range.startContainer, el.find('p:eq(2) em')[0].childNodes[0]);
		equal(range.startOffset, 7);
	});

	test("range.moveStart - move 19 characters to the left", function() {
		// <div><p>test<span><em>a parag|raph</em></span>test</p><p></p><p>test<span><em>a parag|raph</em></span>test</p></div>
		//                              |                                                       |
		//                              A                                                       B
		// go from B to A
		var el = jQuery('<div><p>test<span><em>a paragraph</em></span>test</p><p></p><p>test<span><em>a paragraph</em></span>test</p></div>');
		var changeEditor = getIce(el);
		var range = changeEditor.env.selection.createRange();

		range.setStart(el.find('p:eq(2) em')[0].childNodes[0], 7);
		range.moveStart('character', -19);

		equal(range.startContainer, el.find('p:eq(0) em')[0].childNodes[0]);
		equal(range.startOffset, 7);
	});

});
