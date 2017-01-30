/**
 * Window.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Window.less
 * @class tinymce.ui.Window
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/Window", [
	"tinymce/ui/FloatPanel",
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils",
	"tinymce/ui/KeyboardNavigation",
	"tinymce/ui/DragHelper"
], function(FloatPanel, Panel, DomUtils, KeyboardNavigation, DragHelper) {
	"use strict";

	var Window = FloatPanel.extend({
		modal: true,

		Defaults: {
			border: 1,
			layout: 'flex',
			containerCls: 'panel',
			role: 'dialog',
			callbacks: {
				submit: function() {
					this.fire('submit', {data: this.toJSON()});
				},

				close: function() {
					this.close();
				}
			}
		},

		init: function(settings) {
			var self = this;

			self._super(settings);

			self.addClass('window');

			// Create statusbar
			if (settings.buttons) {
				self.statusbar = new Panel({
					layout: 'flex',
					border: '1 0 0 0',
					spacing: 3,
					padding: 10,
					align: 'center',
					pack: 'end',
					defaults: {
						type: 'button'
					},
					items: settings.buttons
				});

				self.statusbar.addClass('foot');
				self.statusbar.parent(self);
			}

			self.on('click', function(e) {
				if (e.target.className.indexOf(self.classPrefix + 'close') != -1) {
					self.close();
				}
			});
/*
			self.on('postrender show', function(e) {
				if (e.control == self) {
					var parentWin = getTopMostWindow(), zIndex = FloatPanel.zIndex;

					if (parentWin) {
						zIndex = parentWin.zIndex;
					}

					if (!DomUtils.get(prefix + 'modal-block')) {
						var modalBlockEl = DomUtils.createFragment('<div id="' + prefix + 'modal-block" class="' +
						prefix + 'reset ' + prefix + 'fade"></div>');

						modalBlockEl = modalBlockEl.firstChild;

						self.getContainerElm().appendChild(modalBlockEl);

						setTimeout(function() {
							DomUtils.addClass(modalBlockEl, prefix + 'in');
							DomUtils.addClass(self.getEl(), prefix + 'in');
						}, 0);

						FloatPanel.zOrder.push({zIndex: zIndex});
						DomUtils.css(self.getEl(), 'z-index', zIndex + 1);
					}

					DomUtils.css(DomUtils.get(prefix + 'modal-block'), 'z-index', zIndex - 1);
				}
			});

			self.on('close hide', function(e) {
				if (e.control == self) {
					var topWin = getTopMostWindow();

					if (!topWin) {
						var modalBlockEl = document.getElementById(prefix + 'modal-block');
						if (modalBlockEl) {
							modalBlockEl.parentNode.removeChild(modalBlockEl);
						}
					} else {
						DomUtils.css(DomUtils.get(prefix + 'modal-block'), 'z-index', topWin.zIndex - 1);
					}
				}
			});
*/
			self.aria('label', settings.title);
			self._fullscreen = false;
		},

		recalc: function() {
			var self = this, statusbar = self.statusbar, layoutRect, width, needsRecalc;

			if (self._fullscreen) {
				self.layoutRect(DomUtils.getWindowSize());
				self.layoutRect().contentH = self.layoutRect().innerH;
			}

			self._super();

			layoutRect = self.layoutRect();

			// Resize window based on title width
			if (self.settings.title && !self._fullscreen) {
				width = layoutRect.headerW;
				if (width > layoutRect.minW) {
					layoutRect.minW = layoutRect.w = width + (layoutRect.w - layoutRect.innerW);
					layoutRect.innerW = layoutRect.w - layoutRect.deltaW;
					needsRecalc = true;
				}
			}

			// Resize window based on statusbar width
			if (statusbar) {
				statusbar.layoutRect({w: self.layoutRect().innerW}).recalc();

				width = statusbar.layoutRect().minW + layoutRect.deltaW;
				if (width > layoutRect.minW) {
					layoutRect.minW = layoutRect.w = width;
					layoutRect.innerW = layoutRect.w - layoutRect.deltaW;
					needsRecalc = true;
				}
			}

			// Recalc body and disable auto resize
			if (needsRecalc) {
				self.recalc();
				return;
			}
		},

		initLayoutRect: function() {
			var self = this, layoutRect = self._super(), deltaH = 0, headEl;

			// Reserve vertical space for title
			if (self.settings.title && !self._fullscreen) {
				headEl = self.getEl('head');
				layoutRect.headerW = headEl.offsetWidth;
				layoutRect.headerH = headEl.offsetHeight;
				deltaH += layoutRect.headerH;
			}

			// Reserve vertical space for statusbar
			if (self.statusbar) {
				deltaH += self.statusbar.layoutRect().h;
			}

			layoutRect.deltaH += deltaH;
			layoutRect.minH += deltaH;
			//layoutRect.innerH -= deltaH;
			layoutRect.h += deltaH;

			var rect = DomUtils.getWindowSize();

			layoutRect.x = Math.max(0, rect.w / 2 - layoutRect.w / 2);
			layoutRect.y = Math.max(0, rect.h / 2 - layoutRect.h / 2);

			return layoutRect;
		},

		renderHtml: function() {
			var self = this, layout = self._layout, id = self._id, prefix = self.classPrefix;
			var settings = self.settings, headerHtml = '', footerHtml = '', html = settings.html;

			self.preRender();
			layout.preRender(self);

			if (settings.title) {
				headerHtml = (
					'<div id="' + id + '-head" class="' + prefix + 'window-head">' +
						'<div class="' + prefix + 'title">' + settings.title + '</div>' +
						'<button type="button" class="' + prefix + 'close" aria-hidden="true">&times;</button>' +
						'<div id="' + id + '-dragh" class="' + prefix + 'dragh"></div>' +
					'</div>'
				);
			}

			if (settings.url) {
				html = '<iframe src="' + settings.url + '" tabindex="-1"></iframe>';
			}

			if (typeof(html) == "undefined") {
				html = layout.renderHtml(self);
			}

			if (self.statusbar) {
				footerHtml = self.statusbar.renderHtml();
			}

			return (
				'<div id="' + id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					headerHtml +
					'<div id="' + id + '-body" class="' + self.classes('body') + '">' +
						html +
					'</div>' +
					footerHtml +
				'</div>'
			);
		},

		fullscreen: function(state) {
			var self = this, documentElement = document.documentElement, slowRendering, prefix = self.classPrefix, layoutRect;

			if (state != self._fullscreen) {
				DomUtils.on(window, 'resize', function() {
					var time;

					if (self._fullscreen) {
						// Time the layout time if it's to slow use a timeout to not hog the CPU
						if (!slowRendering) {
							time = new Date().getTime();

							var rect = DomUtils.getWindowSize();
							self.moveTo(0, 0).resizeTo(rect.w, rect.h);

							if ((new Date().getTime()) - time > 50) {
								slowRendering = true;
							}
						} else {
							if (!self._timer) {
								self._timer = setTimeout(function() {
									var rect = DomUtils.getWindowSize();
									self.moveTo(0, 0).resizeTo(rect.w, rect.h);

									self._timer = 0;
								}, 50);
							}
						}
					}
				});

				layoutRect = self.layoutRect();
				self._fullscreen = state;

				if (!state) {
					self._borderBox = self.parseBox(self.settings.border);
					self.getEl('head').style.display = '';
					layoutRect.deltaH += layoutRect.headerH;
					DomUtils.removeClass(documentElement, prefix + 'fullscreen');
					DomUtils.removeClass(document.body, prefix + 'fullscreen');
					self.removeClass('fullscreen');
					self.moveTo(self._initial.x, self._initial.y).resizeTo(self._initial.w, self._initial.h);
				} else {
					self._initial = {x: layoutRect.x, y: layoutRect.y, w: layoutRect.w, h: layoutRect.h};

					self._borderBox = self.parseBox('0');
					self.getEl('head').style.display = 'none';
					layoutRect.deltaH -= layoutRect.headerH + 2;
					DomUtils.addClass(documentElement, prefix + 'fullscreen');
					DomUtils.addClass(document.body, prefix + 'fullscreen');
					self.addClass('fullscreen');

					var rect = DomUtils.getWindowSize();
					self.moveTo(0, 0).resizeTo(rect.w, rect.h);
				}
			}

			return self.reflow();
		},

		postRender: function() {
			var self = this, items = [], focusCtrl, autoFocusFound, startPos;

			setTimeout(function() {
				self.addClass('in');
			}, 0);

			self.find('*').each(function(ctrl) {
				if (ctrl.canFocus) {
					autoFocusFound = autoFocusFound || ctrl.settings.autofocus;
					focusCtrl = focusCtrl || ctrl;

					// TODO: Figure out a better way
					if (ctrl.type == 'filepicker') {
						items.push(ctrl.getEl('inp'));

						if (ctrl.getEl('open')) {
							items.push(ctrl.getEl('open').firstChild);
						}
					} else {
						items.push(ctrl.getEl());
					}
				}
			});

			if (self.statusbar) {
				self.statusbar.find('*').each(function(ctrl) {
					if (ctrl.canFocus) {
						autoFocusFound = autoFocusFound || ctrl.settings.autofocus;
						focusCtrl = focusCtrl || ctrl;
						items.push(ctrl.getEl());
					}
				});
			}

			self.keyboardNavigation = new KeyboardNavigation({
				root: self,
				enableLeftRight: false,
				enableUpDown: false,
				items: items,
				onCancel: function() {
					self.close();
				}
			});

			self._super();

			if (self.statusbar) {
				self.statusbar.postRender();
			}

			if (!autoFocusFound && focusCtrl) {
				focusCtrl.focus();
			}

			this.dragHelger = new DragHelper(self._id + '-dragh', {
				start: function() {
					startPos = {
						x: self.layoutRect().x,
						y: self.layoutRect().y
					};
				},

				drag: function(e) {
					self.moveTo(startPos.x + e.deltaX, startPos.y + e.deltaY);
				}
			});

			self.on('submit', function(e) {
				if (!e.isDefaultPrevented()) {
					self.close();
				}
			});
		},

		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		remove: function() {
			var self = this;

			self._super();
			self.dragHelger.destroy();

			if (self.statusbar) {
				this.statusbar.remove();
			}
		}
	});

	return Window;
});