/**
 * GridLayout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.GridLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/GridLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		recalc: function(container) {
			var settings = container.settings, rows, cols, items, contLayoutRect, width, height, rect,
				ctrlLayoutRect, ctrl, x, y, posX, posY, ctrlSettings, contPaddingBox, align, spacingH, spacingV, alignH, alignV, maxX, maxY,
				colWidths = [], rowHeights = [], ctrlMinWidth, ctrlMinHeight, alignX, alignY, availableWidth, availableHeight;

			// Get layout settings
			settings = container.settings;
			items = container.items().filter(':visible');
			contLayoutRect = container.layoutRect();
			cols = settings.columns || Math.ceil(Math.sqrt(items.length));
			rows = Math.ceil(items.length / cols);
			spacingH = settings.spacingH || settings.spacing || 0;
			spacingV = settings.spacingV || settings.spacing || 0;
			alignH = settings.alignH || settings.align;
			alignV = settings.alignV || settings.align;
			contPaddingBox = container._paddingBox;

			// Zero padd columnWidths
			for (x = 0; x < cols; x++) {
				colWidths.push(0);
			}

			// Zero padd rowHeights
			for (y = 0; y < rows; y++) {
				rowHeights.push(0);
			}

			// Calculate columnWidths and rowHeights
			for (y = 0; y < rows; y++) {
				for (x = 0; x < cols; x++) {
					ctrl = items[y * cols + x];

					// Out of bounds
					if (!ctrl) {
						break;
					}

					ctrlLayoutRect = ctrl.layoutRect();
					ctrlMinWidth = ctrlLayoutRect.minW;
					ctrlMinHeight = ctrlLayoutRect.minH;

					colWidths[x] = ctrlMinWidth > colWidths[x] ? ctrlMinWidth : colWidths[x];
					rowHeights[y] = ctrlMinHeight > rowHeights[y] ? ctrlMinHeight : rowHeights[y];
				}
			}

			// Calculate maxX
			availableWidth = contLayoutRect.innerW - contPaddingBox.left - contPaddingBox.right;
			for (maxX = 0, x = 0; x < cols; x++) {
				maxX += colWidths[x] + (x > 0 ? spacingH : 0);
				availableWidth -= (x > 0 ? spacingH : 0) + colWidths[x];
			}

			// Calculate maxY
			availableHeight = contLayoutRect.innerH - contPaddingBox.top - contPaddingBox.bottom;
			for (maxY = 0, y = 0; y < rows; y++) {
				maxY += rowHeights[y] + (y > 0 ? spacingV : 0);
				availableHeight -= (y > 0 ? spacingV : 0) + rowHeights[y];
			}

			maxX += contPaddingBox.left + contPaddingBox.right;
			maxY += contPaddingBox.top + contPaddingBox.bottom;

			// Calculate minW/minH
			rect = {};
			rect.minW = maxX + (contLayoutRect.w - contLayoutRect.innerW);
			rect.minH = maxY + (contLayoutRect.h - contLayoutRect.innerH);

			rect.contentW = rect.minW - contLayoutRect.deltaW;
			rect.contentH = rect.minH - contLayoutRect.deltaH;
			rect.minW = Math.min(rect.minW, contLayoutRect.maxW);
			rect.minH = Math.min(rect.minH, contLayoutRect.maxH);
			rect.minW = Math.max(rect.minW, contLayoutRect.startMinWidth);
			rect.minH = Math.max(rect.minH, contLayoutRect.startMinHeight);

			// Resize container container if minSize was changed
			if (contLayoutRect.autoResize && (rect.minW != contLayoutRect.minW || rect.minH != contLayoutRect.minH)) {
				rect.w = rect.minW;
				rect.h = rect.minH;

				container.layoutRect(rect);
				this.recalc(container);

				// Forced recalc for example if items are hidden/shown
				if (container._lastRect === null) {
					var parentCtrl = container.parent();
					if (parentCtrl) {
						parentCtrl._lastRect = null;
						parentCtrl.recalc();
					}
				}

				return;
			}

			// Update contentW/contentH so absEnd moves correctly
			if (contLayoutRect.autoResize) {
				rect = container.layoutRect(rect);
				rect.contentW = rect.minW - contLayoutRect.deltaW;
				rect.contentH = rect.minH - contLayoutRect.deltaH;
			}

			var flexV;

			if (settings.packV == 'start') {
				flexV = 0;
			} else {
				flexV = availableHeight > 0 ? Math.floor(availableHeight / rows) : 0;
			}

			// Calculate totalFlex
			var totalFlex = 0;
			var flexWidths = settings.flexWidths;
			if (flexWidths) {
				for (x = 0; x < flexWidths.length; x++) {
					totalFlex += flexWidths[x];
				}
			} else {
				totalFlex = cols;
			}

			// Calculate new column widths based on flex values
			var ratio = availableWidth / totalFlex;
			for (x = 0; x < cols; x++) {
				colWidths[x] += flexWidths ? Math.ceil(flexWidths[x] * ratio) : ratio;
			}

			// Move/resize controls
			posY = contPaddingBox.top;
			for (y = 0; y < rows; y++) {
				posX = contPaddingBox.left;
				height = rowHeights[y] + flexV;

				for (x = 0; x < cols; x++) {
					ctrl = items[y * cols + x];

					// No more controls to render then break
					if (!ctrl) {
						break;
					}

					// Get control settings and calculate x, y
					ctrlSettings = ctrl.settings;
					ctrlLayoutRect = ctrl.layoutRect();
					width = colWidths[x];
					alignX = alignY = 0;
					ctrlLayoutRect.x = posX;
					ctrlLayoutRect.y = posY;

					// Align control horizontal
					align = ctrlSettings.alignH || alignH;
					if (align == "center") {
						ctrlLayoutRect.x = posX + (width / 2) - (ctrlLayoutRect.w / 2);
					} else if (align == "right") {
						ctrlLayoutRect.x = posX + width - ctrlLayoutRect.w;
					} else if (align == "stretch") {
						ctrlLayoutRect.w = width;
					}

					// Align control vertical
					align = ctrlSettings.alignV || alignV;
					if (align == "center") {
						ctrlLayoutRect.y = posY + (height / 2) - (ctrlLayoutRect.h / 2);
					} else  if (align == "bottom") {
						ctrlLayoutRect.y = posY + height - ctrlLayoutRect.h;
					} else if (align == "stretch") {
						ctrlLayoutRect.h = height;
					}

					ctrl.layoutRect(ctrlLayoutRect);

					posX += width + spacingH;

					if (ctrl.recalc) {
						ctrl.recalc();
					}
				}

				posY += height + spacingV;
			}
		}
	});
});