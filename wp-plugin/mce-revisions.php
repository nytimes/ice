<?php
/*
Plugin Name: Ice Visual Revisions
Plugin URI: [URL to a webpage about the WP plugin, optional]
Description: [few sentences explaining the functionality]
Version: 1.0
Author: Andrew Ozz
Author URI: (optional)

Copyright Andrew Ozz

Released under the GPL v.2

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/


// Add plugins to TinyMCE
add_filter('mce_external_plugins', 'vrev_load_plugins');
function vrev_load_plugins($plugins) {
	$url = plugin_dir_url(__file__);

	$plugins['ice'] = $url . 'ice/editor_plugin.js';
	$plugins['icerevisions'] = $url . 'icerevisions/editor_plugin.js';

	return $plugins;
}

// Add buttons to TinyMCE
add_filter('mce_buttons', 'vrev_add_mce_buttons');
function vrev_add_mce_buttons($buttons) {
	return array_merge( $buttons, array(
		'|',
		'iceaccept',
		'icereject',
		'iceacceptall',
		'icerejectall',
		'|',
		'ice_toggleshowchanges',
	//	'ice_togglechanges',
	//	'ice_smartquotes'
	));
}

// can add or change the TinyMCE init here
// $settings is a PHP associative array containing all init strings: $settings['mce_setting_name'] = 'setting string';
add_filter('tiny_mce_before_init', 'vrev_mce_settings');
function vrev_mce_settings($settings) {
	global $current_user, $post;
	$new_post = $post->post_status == 'auto-draft';

	/*
	Any of the following can be set by using the 'mce_ice_settings' filter.
	Note that the array is json encoded before adding it to the MCE settings.
		deleteTag: 'span',
		insertTag: 'span',
		deleteClass: 'del',
		insertClass: 'ins',
		attrPrefix: 'data-',
		preserveOnPaste: 'p',
		isTracking: true,
		contentEditable: true,
		css: 'css/ice.css',
		manualInit: false,
		user: { name: 'Some Name', id: Math.random() },
	*/
	$ice_settings = array(
		'user' => array(
			'name' => esc_html( $current_user->display_name ),
			'id' => $current_user->ID
		),
		'manualInit' => true,
		'isTracking' => !$new_post
	);

	$ice_settings = apply_filters('mce_ice_settings', $ice_settings);
	$settings['ice'] = json_encode( $ice_settings );

	return $settings;
}

// append textarea TODO: move to JS?
add_action('dbx_post_sidebar', 'vrev_post_meta', 50);
function vrev_post_meta() {
	global $post_ID;

	if ( !current_user_can('edit_post', $post_ID) )
		return;

	$meta = get_post_meta($post_ID, '_ice_revisions_content');
	$meta = (string) array_pop($meta);
	$meta = wp_htmledit_pre($meta);
	?>
	<div class="hidden"><textarea name="ice-revisions-content" id="ice-revisions-content"><?php echo $meta; ?></textarea></div>
	<?php

	wp_enqueue_script('mce-revisions', plugin_dir_url(__file__) . 'js/mce-revisions.js', array('jquery'), '1.0', true );
}

// save the content with revisions as meta
add_filter('wp_insert_post_data', 'vrev_save_revisions_content', 10, 2);
function vrev_save_revisions_content($data, $postarr) {
	if ( isset($postarr['ice-revisions-content']) ) {
		$post_id = (int) $postarr['post_ID'];
		if ( !current_user_can('edit_post', $post_id) )
			return $data;

		if ( $postarr['post_status'] == 'publish' || $postarr['post_status'] == 'future' || !empty($postarr['publish']) )
			$meta = $postarr['ice-revisions-content'];
		else
			$meta = $postarr['post_content'];

		unset($postarr['ice-revisions-content']);
		update_post_meta($post_id, '_ice_revisions_content', $meta);
	}

	return $data;
}

// load the content with revisions when post is published
add_filter('the_editor_content', 'vrev_load_revisions_content', 1);
function vrev_load_revisions_content($content) {
	global $post, $post_ID, $pagenow;
	static $runonce = false;

	if ( !isset($post) || !isset($post_ID) || !current_user_can('edit_post', $post_ID) || $runonce || $pagenow != 'post.php' )
		return $content;

	$runonce = true;
	if ( $post->post_status == 'publish' || $post->post_status == 'future' ) {
		$meta = get_post_meta($post_ID, '_ice_revisions_content');
		$content = (string) array_pop($meta);
	}

	return $content;
}

// Hide the WP revisions metabox when post is published.
// Restoring a revision for a published post from there is not compatible with Ice revisions.
add_action('add_meta_boxes', 'vrev_hide_wp_revisions', 20, 2);
function vrev_hide_wp_revisions($post_type, $post) {
	if ( $post->post_status == 'publish' || $post->post_status == 'future' ) {
		remove_meta_box('revisionsdiv', '', 'normal');
		remove_meta_box('revisionsdiv', '', 'advanced');
		remove_meta_box('revisionsdiv', '', 'side');
	}
}

// show "track changes" button in fullscreen mode
add_filter('wp_fullscreen_buttons', 'vrev_fullscreen_button');
function vrev_fullscreen_button($buttons) {
	?>
	<style type="text/css" scoped="scoped">
	#wp_fs_ice_toggleshowchanges span {background: url("<?php echo plugin_dir_url(__file__) . 'ice/img/ice-showchanges.png'; ?>");
	</style>
	<?php
	$buttons['ice_toggleshowchanges'] = array( 'title' => __('Show Track Changes', 'mce-revisions'), 'onclick' => 'ice_toggleshowchanges();', 'both' => false );
	return $buttons;
}

