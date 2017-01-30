/**
 * FloatPanel.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less FloatPanel.less
 * @class tinymce.ui.FloatPanel
 * @extends tinymce.ui.Panel
 */
define("tinymce/ui/FloatPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/Movable",
	"tinymce/ui/Resizable",
	"tinymce/ui/DomUtils"
], function(Panel, Movable, Resizable, DomUtils) {
	"use strict";

	var documentClickHandler, autoHidePanels = [];
	var zOrder = [], hasModal;

	var FloatPanel = Panel.extend({
		Mixins: [Movable, Resizable],

		init: function(settings) {
			var self = this;

			function reorder() {
				var i, zIndex = FloatPanel.zIndex || 0xFFFF, topModal;

				if (zOrder.length) {
					for (i = 0; i < zOrder.length; i++) {
						if (zOrder[i].modal) {
							zIndex++;
							topModal = zOrder[i];
						}

						zOrder[i].getEl().style.zIndex = zIndex;
						zOrder[i].zIndex = zIndex;
						zIndex++;
					}
				}

				var modalBlockEl = document.getElementById(self.classPrefix + 'modal-block');

				if (topModal) {
					DomUtils.css(modalBlockEl, 'z-index', topModal.zIndex - 1);
				} else if (modalBlockEl) {
					modalBlockEl.parentNode.removeChild(modalBlockEl);
					hasModal = false;
				}

				FloatPanel.currentZIndex = zIndex;
			}

			function isChildOf(ctrl, parent) {
				while (ctrl) {
					if (ctrl == parent) {
						return true;
					}

					ctrl = ctrl.parent();
				}
			}

			self._super(settings);
			self._eventsRoot = self;

			self.addClass('floatpanel');

			// Hide floatpanes on click out side the root button
			if (settings.autohide) {
				if (!documentClickHandler) {
					documentClickHandler = function(e) {
						var i, clickCtrl = self.getParentCtrl(e.target);

						// Hide any float panel when a click is out side that float panel and the
						// float panels direct parent for example a click on a menu button
						i = autoHidePanels.length;
						while (i--) {
							if (clickCtrl) {
								if (isChildOf(clickCtrl, autoHidePanels[i]) || autoHidePanels[i].parent() === clickCtrl) {
									continue;
								}
							}

							autoHidePanels[i].hide();
						}
					};

					DomUtils.on(document, 'click', documentClickHandler);
				}

				autoHidePanels.push(self);
			}

			self.on('postrender show', function(e) {
				if (e.control == self) {
					var modalBlockEl, prefix = self.classPrefix;

					if (self.modal && !hasModal) {
						modalBlockEl = DomUtils.createFragment('<div id="' + prefix + 'modal-block" class="' +
							prefix + 'reset ' + prefix + 'fade"></div>');
						modalBlockEl = modalBlockEl.firstChild;

						self.getContainerElm().appendChild(modalBlockEl);

						setTimeout(function() {
							DomUtils.addClass(modalBlockEl, prefix + 'in');
							DomUtils.addClass(self.getEl(), prefix + 'in');
						}, 0);

						hasModal = true;
					}

					zOrder.push(self);
					reorder();
				}
			});

			self.on('close hide', function(e) {
				if (e.control == self) {
					var i = zOrder.length;

					while (i--) {
						if (zOrder[i] === self) {
							zOrder.splice(i, 1);
						}
					}

					reorder();
				}
			});

			if (settings.popover) {
				self._preBodyHtml = '<div class="' + self.classPrefix + 'arrow"></div>';
				self.addClass('popover').addClass('bottom').addClass('start');
			}
		},

		show: function() {
			var self = this, i, state = self._super();

			i = autoHidePanels.length;
			while (i--) {
				if (autoHidePanels[i] === self) {
					break;
				}
			}

			if (self.settings.autohide && i === -1) {
				autoHidePanels.push(self);
			}

			return state;
		},

		hide: function() {
			var i;

			i = autoHidePanels.length;
			while (i--) {
				if (autoHidePanels[i] === this) {
					autoHidePanels.splice(i, 1);
				}
			}

			return this._super();
		},

		hideAll: function() {
			FloatPanel.hideAll();
		},

		close: function() {
			var self = this;

			self.fire('close');

			return self.remove();
		},

		remove: function() {
			var self = this;

			self._super();
		}
	});

	FloatPanel.hideAll = function() {
		var i = autoHidePanels.length;

		while (i--) {
			autoHidePanels[i].fire('cancel', {}, false);
			autoHidePanels[i].hide();
			autoHidePanels.splice(i, 1);
		}
	};

	return FloatPanel;
});