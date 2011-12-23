$(document).ready(function() {

	// Setup a hidden element where tests can append elements
	$('body').append('<div id="hiddenEl"></div>');
	
	// Setup a general function for ice construction
	window.getIce = function(el) {
		el.attr('contentEditable', true);
		$('#hiddenEl').append(el);
		return new ice.InlineChangeEditor({
			element: el[0],
			isTracking: true,
			currentUser: { id: '4', name: 'Ted' },
			attrNamePrefix: '',
			changeTypes : {
				insertType: {tag: 'span', alias: 'ins' },
				deleteType: {tag: 'span', alias: 'del' }
			},
			plugins: [
				'IceAddTitlePlugin',
				'IceSmartQuotesPlugin',
				{ name: 'IceCopyPastePlugin', settings: { preserve: 'p,a[href],strong[*],em[id|class]' }}
			]
		});
	}

});
