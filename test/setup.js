$(document).ready(function() {

	// Setup a general function for ice construction
	window.getIce = function(el) {
		el.attr('contentEditable', true);
		$('#qunit-fixture').append(el);
		return new ice.InlineChangeEditor({
			element: el[0],
			isTracking: true,
			changeIdAttribute: 'cid',
			userIdAttribute: 'userid',
			userNameAttribute: 'username',
			timeAttribute: 'time',
			currentUser: { id: '4', name: 'Ted' },
			changeTypes : {
				insertType: {tag: 'span', alias: 'ins' },
				deleteType: {tag: 'span', alias: 'del' }
			},
			plugins: [
				'IceAddTitlePlugin',
				'IceSmartQuotesPlugin',
				{ name: 'IceCopyPastePlugin', settings: { preserve: 'p,a[href],strong[*],em[id|class]' }}
			]
		}).startTracking();
	};


});
