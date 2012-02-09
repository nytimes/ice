jQuery(document).ready(function($){
	$('#publish').bind('click.ice_revisions', function(e){
		var content = $('#content'), action = $('#hidden_post_status').val() == 'publish' ? 'updating.' : 'publishing.';

		if ( !content || content.val().indexOf('data-username=') == -1 )
			return;

		if ( typeof(tinymce) == 'undefined' ) {
			e.preventDefault();
			alert('Please remove all revision tracking spans before ' + action);
		} else if ( !tinymce.get('content') ) {
			e.preventDefault();
			alert('Please switch to Visual mode before ' + action);
		} else {
			return;
		}

		$(this).removeClass('button-primary-disabled');
		$('#ajax-loading').css('visibility', '');
	});
});

function ice_toggleshowchanges() {
	var ed = tinymce.get('wp_mce_fullscreen');
	ed.execCommand('ice_toggleshowchanges');
}
