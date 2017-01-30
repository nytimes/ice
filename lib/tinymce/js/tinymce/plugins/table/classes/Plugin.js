/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the table plugin.
 *
 * @class tinymce.tableplugin.Plugin
 * @private
 */
define("tinymce/tableplugin/Plugin", [
	"tinymce/tableplugin/TableGrid",
	"tinymce/tableplugin/Quirks",
	"tinymce/tableplugin/CellSelection",
	"tinymce/util/Tools",
	"tinymce/dom/TreeWalker",
	"tinymce/Env",
	"tinymce/PluginManager"
], function(TableGrid, Quirks, CellSelection, Tools, TreeWalker, Env, PluginManager) {
	var each = Tools.each;

	function Plugin(editor) {
		var winMan, clipboardRows, self = this; // Might be selected cells on reload

		function removePxSuffix(size) {
			return size ? size.replace(/px$/, '') : "";
		}

		function addSizeSuffix(size) {
			if (/^[0-9]+$/.test(size)) {
				size += "px";
			}

			return size;
		}

		function tableDialog() {
			var dom = editor.dom, tableElm, data;

			tableElm = editor.dom.getParent(editor.selection.getNode(), 'table');

			data = {
				width: removePxSuffix(dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width')),
				height: removePxSuffix(dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height')),
				cellspacing: dom.getAttrib(tableElm, 'cellspacing'),
				cellpadding: dom.getAttrib(tableElm, 'cellpadding'),
				border: dom.getAttrib(tableElm, 'border'),
				caption: !!dom.select('caption', tableElm)[0]
			};

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(tableElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Table properties",
				items: {
					type: 'form',
					layout: 'grid',
					columns: 2,
					data: data,
					defaults: {
						type: 'textbox',
						maxWidth: 50
					},
					items: [
						{label: 'Cols', name: 'cols'},
						{label: 'Rows', name: 'rows'},
						{label: 'Width', name: 'width'},
						{label: 'Height', name: 'height'},
						{label: 'Cell spacing', name: 'cellspacing'},
						{label: 'Cell padding', name: 'cellpadding'},
						{label: 'Border', name: 'border'},
						{label: 'Caption', name: 'caption', type: 'checkbox'},
						{
							label: 'Alignment',
							minWidth: 90,
							name: 'align',
							type: 'listbox',
							text: 'None',
							maxWidth: null,
							values: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						}
					]
				},

				onsubmit: function() {
					var data = this.toJSON(), captionElm;

					editor.undoManager.transact(function() {
						editor.dom.setAttribs(tableElm, {
							cellspacing: data.cellspacing,
							cellpadding: data.cellpadding,
							border: data.border
						});

						editor.dom.setStyles(tableElm, {
							width: addSizeSuffix(data.width),
							height: addSizeSuffix(data.height)
						});

						// Toggle caption on/off
						captionElm = dom.select('caption', tableElm)[0];

						if (captionElm && !data.caption) {
							dom.remove(captionElm);
						}

						if (!captionElm && data.caption) {
							captionElm = dom.create('caption');

							if (!Env.ie) {
								captionElm.innerHTML = '<br data-mce-bogus="1"/>';
							}

							tableElm.insertBefore(captionElm, tableElm.firstChild);
						}

						// Apply/remove alignment
						if (data.align) {
							editor.formatter.apply('align' + data.align, {}, tableElm);
						} else {
							each('left center right'.split(' '), function(name) {
								editor.formatter.remove('align' + name, {}, tableElm);
							});
						}

						editor.focus();
						editor.addVisual();
					});
				}
			});
		}

		function mergeDialog(grid, cell) {
			editor.windowManager.open({
				title: "Merge cells",
				body: [
					{label: 'Columns', name: 'cols', type: 'textbox', size: 5},
					{label: 'Rows', name: 'rows', type: 'textbox', size: 5}
				],
				onsubmit: function() {
					var data = this.toJSON();

					editor.undoManager.transact(function() {
						grid.merge(cell, data.cols, data.rows);
					});
				}
			});
		}

		function cellDialog() {
			var dom = editor.dom, cellElm, data, cells = [];

			// Get selected cells or the current cell
			cells = editor.dom.select('td.mce-item-selected,th.mce-item-selected');
			cellElm = editor.dom.getParent(editor.selection.getNode(), 'td,th');
			if (!cells.length && cellElm) {
				cells.push(cellElm);
			}

			cellElm = cellElm || cells[0];

			data = {
				width: removePxSuffix(dom.getStyle(cellElm, 'width') || dom.getAttrib(cellElm, 'width')),
				height: removePxSuffix(dom.getStyle(cellElm, 'height') || dom.getAttrib(cellElm, 'height')),
				scope: dom.getAttrib(cellElm, 'scope')
			};

			data.type = cellElm.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(cellElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Cell properties",
				items: {
					type: 'form',
					data: data,
					layout: 'grid',
					columns: 2,
					defaults: {
						type: 'textbox',
						maxWidth: 50
					},
					items: [
						{label: 'Width', name: 'width'},
						{label: 'Height', name: 'height'},
						{
							label: 'Cell type',
							name: 'type',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							menu: [
								{text: 'Cell', value: 'td'},
								{text: 'Header cell', value: 'th'}
							]
						},
						{
							label: 'Scope',
							name: 'scope',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							menu: [
								{text: 'None', value: ''},
								{text: 'Row', value: 'row'},
								{text: 'Column', value: 'col'},
								{text: 'Row group', value: 'rowgroup'},
								{text: 'Column group', value: 'colgroup'}
							]
						},
						{
							label: 'Alignment',
							name: 'align',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							values: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						}
					]
				},

				onsubmit: function() {
					var data = this.toJSON();

					editor.undoManager.transact(function() {
						each(cells, function(cellElm) {
							editor.dom.setAttrib(cellElm, 'scope', data.scope);

							editor.dom.setStyles(cellElm, {
								width: addSizeSuffix(data.width),
								height: addSizeSuffix(data.height)
							});

							// Switch cell type
							if (data.type && cellElm.nodeName.toLowerCase() != data.type) {
								cellElm = dom.rename(cellElm, data.type);
							}

							// Apply/remove alignment
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, cellElm);
							} else {
								each('left center right'.split(' '), function(name) {
									editor.formatter.remove('align' + name, {}, cellElm);
								});
							}
						});

						editor.focus();
					});
				}
			});
		}

		function rowDialog() {
			var dom = editor.dom, tableElm, cellElm, rowElm, data, rows = [];

			tableElm = editor.dom.getParent(editor.selection.getNode(), 'table');
			cellElm = editor.dom.getParent(editor.selection.getNode(), 'td,th');

			each(tableElm.rows, function(row) {
				each(row.cells, function(cell) {
					if (dom.hasClass(cell, 'mce-item-selected') || cell == cellElm) {
						rows.push(row);
						return false;
					}
				});
			});

			rowElm = rows[0];

			data = {
				height: removePxSuffix(dom.getStyle(rowElm, 'height') || dom.getAttrib(rowElm, 'height')),
				scope: dom.getAttrib(rowElm, 'scope')
			};

			data.type = rowElm.parentNode.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(rowElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Row properties",
				items: {
					type: 'form',
					data: data,
					columns: 2,
					defaults: {
						type: 'textbox'
					},
					items: [
						{
							type: 'listbox',
							name: 'type',
							label: 'Row type',
							text: 'None',
							maxWidth: null,
							menu: [
								{text: 'header', value: 'thead'},
								{text: 'body', value: 'tbody'},
								{text: 'footer', value: 'tfoot'}
							]
						},
						{
							type: 'listbox',
							name: 'align',
							label: 'Alignment',
							text: 'None',
							maxWidth: null,
							menu: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						},
						{label: 'Height', name: 'height'}
					]
				},

				onsubmit: function() {
					var data = this.toJSON(), tableElm, oldParentElm, parentElm;

					editor.undoManager.transact(function() {
						each(rows, function(rowElm) {
							editor.dom.setAttrib(rowElm, 'scope', data.scope);

							editor.dom.setStyles(rowElm, {
								height: addSizeSuffix(data.height)
							});

							if (data.type != rowElm.parentNode.nodeName.toLowerCase()) {
								tableElm = dom.getParent(rowElm, 'table');

								oldParentElm = rowElm.parentNode;
								parentElm = dom.select(tableElm, data.type)[0];
								if (!parentElm) {
									parentElm = dom.create(data.type);
									if (tableElm.firstChild) {
										tableElm.insertBefore(parentElm, tableElm.firstChild);
									} else {
										tableElm.appendChild(parentElm);
									}
								}

								parentElm.insertBefore(rowElm, parentElm.firstChild);

								if (!oldParentElm.hasChildNodes()) {
									dom.remove(oldParentElm);
								}
							}

							// Apply/remove alignment
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, rowElm);
							} else {
								each('left center right'.split(' '), function(name) {
									editor.formatter.remove('align' + name, {}, rowElm);
								});
							}
						});

						editor.focus();
					});
				}
			});
		}

		function cmd(command) {
			return function() {
				editor.execCommand(command);
			};
		}

		function insertTable(cols, rows) {
			var y, x, html;

			html = '<table><tbody>';

			for (y = 0; y < rows; y++) {
				html += '<tr>';

				for (x = 0; x < cols; x++) {
					html += '<td>' + (Env.ie ? " " : '<br>') + '</td>';
				}

				html += '</tr>';
			}

			html += '</tbody></table>';

			editor.insertContent(html);
		}

		function postRender() {
			/*jshint validthis:true*/
			var self = this;

			function bindStateListener() {
				self.disabled(!editor.dom.getParent(editor.selection.getNode(), 'table'));

				editor.selection.selectorChanged('table', function(state) {
					self.disabled(!state);
				});
			}

			if (editor.initialized) {
				bindStateListener();
			} else {
				editor.on('init', bindStateListener);
			}
		}

		// Register buttons
		each([
			['table', 'Insert/edit table', 'mceInsertTable'],
			['delete_table', 'Delete table', 'mceTableDelete'],
			['delete_col', 'Delete column', 'mceTableDeleteCol'],
			['delete_row', 'Delete row', 'mceTableDeleteRow'],
			['col_after', 'Insert column after', 'mceTableInsertColAfter'],
			['col_before', 'Insert column before', 'mceTableInsertColBefore'],
			['row_after', 'Insert row after', 'mceTableInsertRowAfter'],
			['row_before', 'Insert row before', 'mceTableInsertRowBefore'],
			['row_props', 'Row properties', 'mceTableRowProps'],
			['cell_props', 'Cell properties', 'mceTableCellProps'],
			['split_cells', 'Split cells', 'mceTableSplitCells'],
			['merge_cells', 'Merge cells', 'mceTableMergeCells']
		], function(c) {
			editor.addButton(c[0], {
				title : c[1],
				cmd : c[2],
				onPostRender: postRender
			});
		});

		function generateTableGrid() {
			var html = '';

			html = '<table role="presentation" class="mce-grid mce-grid-border">';

			for (var y = 0; y < 10; y++) {
				html += '<tr>';

				for (var x = 0; x < 10; x++) {
					html += '<td><a href="#" data-mce-index="' + x + ',' + y + '"></a></td>';
				}

				html += '</tr>';
			}

			html += '</table>';

			html += '<div class="mce-text-center">0 x 0</div>';

			return html;
		}

		editor.addMenuItem('inserttable', {
			text: 'Insert table',
			icon: 'table',
			context: 'table',
			onhide: function() {
				editor.dom.removeClass(this.menu.items()[0].getEl().getElementsByTagName('a'), 'mce-active');
			},
			menu: [
				{
					type: 'container',
					html: generateTableGrid(),

					onmousemove: function(e) {
						var target = e.target;

						if (target.nodeName == 'A') {
							var table = editor.dom.getParent(target, 'table');
							var pos = target.getAttribute('data-mce-index');

							if (pos != this.lastPos) {
								pos = pos.split(',');

								pos[0] = parseInt(pos[0], 10);
								pos[1] = parseInt(pos[1], 10);

								for (var y = 0; y < 10; y++) {
									for (var x = 0; x < 10; x++) {
										editor.dom.toggleClass(
											table.rows[y].childNodes[x].firstChild,
											'mce-active',
											x <= pos[0] && y <= pos[1]
										);
									}
								}

								table.nextSibling.innerHTML = (pos[0] + 1) + ' x '+ (pos[1] + 1);
								this.lastPos = pos;
							}
						}
					},

					onclick: function(e) {
						if (e.target.nodeName == 'A' && this.lastPos) {
							e.preventDefault();

							insertTable(this.lastPos[0] + 1, this.lastPos[1] + 1);

							// TODO: Maybe rework this?
							this.parent().cancel(); // Close parent menu as if it was a click
						}
					}
				}
			]
		});

		editor.addMenuItem('tableprops', {
			text: 'Table properties',
			context: 'table',
			onPostRender: postRender,
			onclick: tableDialog
		});

		editor.addMenuItem('deletetable', {
			text: 'Delete table',
			context: 'table',
			onPostRender: postRender,
			cmd: 'mceTableDelete'
		});

		editor.addMenuItem('cell', {
			separator: 'before',
			text: 'Cell',
			context: 'table',
			menu: [
				{text: 'Cell properties', onclick: cmd('mceTableCellProps'), onPostRender: postRender},
				{text: 'Merge cells', onclick: cmd('mceTableMergeCells'), onPostRender: postRender},
				{text: 'Split cell', onclick: cmd('mceTableSplitCells'), onPostRender: postRender}
			]
		});

		editor.addMenuItem('row', {
			text: 'Row',
			context: 'table',
			menu: [
				{text: 'Insert row before', onclick: cmd('mceTableInsertRowBefore'), onPostRender: postRender},
				{text: 'Insert row after', onclick: cmd('mceTableInsertRowAfter'), onPostRender: postRender},
				{text: 'Delete row', onclick: cmd('mceTableDeleteRow'), onPostRender: postRender},
				{text: 'Row properties', onclick: cmd('mceTableRowProps'), onPostRender: postRender},
				{text: '-'},
				{text: 'Cut row', onclick: cmd('mceTableCutRow'), onPostRender: postRender},
				{text: 'Copy row', onclick: cmd('mceTableCopyRow'), onPostRender: postRender},
				{text: 'Paste row before', onclick: cmd('mceTablePasteRowBefore'), onPostRender: postRender},
				{text: 'Paste row after', onclick: cmd('mceTablePasteRowAfter'), onPostRender: postRender}
			]
		});

		editor.addMenuItem('column', {
			text: 'Column',
			context: 'table',
			menu: [
				{text: 'Insert column before', onclick: cmd('mceTableInsertColBefore'), onPostRender: postRender},
				{text: 'Insert column after', onclick: cmd('mceTableInsertColAfter'), onPostRender: postRender},
				{text: 'Delete column', onclick: cmd('mceTableDeleteCol'), onPostRender: postRender}
			]
		});

		// Select whole table is a table border is clicked
		if (!Env.isIE) {
			editor.on('click', function(e) {
				e = e.target;

				if (e.nodeName === 'TABLE') {
					editor.selection.select(e);
					editor.nodeChanged();
				}
			});
		}

		self.quirks = new Quirks(editor);

		editor.on('Init', function() {
			winMan = editor.windowManager;
			self.cellSelection = new CellSelection(editor);
		});

		// Register action commands
		each({
			mceTableSplitCells: function(grid) {
				grid.split();
			},

			mceTableMergeCells: function(grid) {
				var rowSpan, colSpan, cell;

				cell = editor.dom.getParent(editor.selection.getNode(), 'th,td');
				if (cell) {
					rowSpan = cell.rowSpan;
					colSpan = cell.colSpan;
				}

				if (!editor.dom.select('td.mce-item-selected,th.mce-item-selected').length) {
					mergeDialog(grid, cell);
				} else {
					grid.merge();
				}
			},

			mceTableInsertRowBefore: function(grid) {
				grid.insertRow(true);
			},

			mceTableInsertRowAfter: function(grid) {
				grid.insertRow();
			},

			mceTableInsertColBefore: function(grid) {
				grid.insertCol(true);
			},

			mceTableInsertColAfter: function(grid) {
				grid.insertCol();
			},

			mceTableDeleteCol: function(grid) {
				grid.deleteCols();
			},

			mceTableDeleteRow: function(grid) {
				grid.deleteRows();
			},

			mceTableCutRow: function(grid) {
				clipboardRows = grid.cutRows();
			},

			mceTableCopyRow: function(grid) {
				clipboardRows = grid.copyRows();
			},

			mceTablePasteRowBefore: function(grid) {
				grid.pasteRows(clipboardRows, true);
			},

			mceTablePasteRowAfter: function(grid) {
				grid.pasteRows(clipboardRows);
			},

			mceTableDelete: function(grid) {
				grid.deleteTable();
			}
		}, function(func, name) {
			editor.addCommand(name, function() {
				var grid = new TableGrid(editor.selection);

				if (grid) {
					func(grid);
					editor.execCommand('mceRepaint');
					self.cellSelection.clear();
				}
			});
		});

		// Register dialog commands
		each({
			mceInsertTable: function() {
				tableDialog();
			},

			mceTableRowProps: rowDialog,
			mceTableCellProps: cellDialog
		}, function(func, name) {
			editor.addCommand(name, function(ui, val) {
				func(val);
			});
		});
	}

	PluginManager.add('table', Plugin);
});
