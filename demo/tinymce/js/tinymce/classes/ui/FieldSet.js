/**
 * FieldSet.js
 *
 * Copyright 2003-2013, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less FieldSet.less
 * @class tinymce.ui.FieldSet
 * @extends tinymce.ui.Form
 */
define("tinymce/ui/FieldSet", [
	"tinymce/ui/Form"
], function(Form) {
	"use strict";

	return Form.extend({
		Defaults: {
			containerCls: 'fieldset',
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			flex: 1,
			padding: "25 15 5 15",
			labelGap: 30,
			spacing: 10,
			border: 1
		},

		renderHtml: function() {
			var self = this, layout = self._layout, prefix = self.classPrefix;

			self.preRender();
			layout.preRender(self);

			return (
				'<fieldset id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self.settings.title ? ('<legend id="' + self._id + '-title" class="' + prefix + 'fieldset-title">' +
						self.settings.title + '</legend>') : '') +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</fieldset>'
			);
		}
	});
});