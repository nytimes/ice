(function () {
    tinymce.create('tinymce.plugins.IcePlugin', {

        /**
         * Tinymce initializtion API for ice. An `ice` object is expected
         * with any of the following params.
         */
        // set this to false if you want the plugin to load ice.js, in which case you also need to define path_to_ice_js
        ice_loaded_externally: true,
        path_to_ice_js: '', // required if loading ice.js via plugin, i.e. ice_loaded_externally is false
        deleteTag: 'span',
        insertTag: 'span',
        deleteClass: 'del',
        insertClass: 'ins',
        changeIdAttribute: 'data-cid',
        userIdAttribute: 'data-userid',
        userNameAttribute: 'data-username',
        timeAttribute: 'data-time',
        preserveOnPaste: 'p',
        user: {name: 'Unknown User', id: Math.random()},
        isTracking: false,
        contentEditable: true,
        css: 'css/ice.css',
        mergeBlocks: true,
        titleDateFormat: 'm/d/Y h:ia',
        afterInit: function () {},
        afterClean: function (body) {
            return body;
        },
        beforePasteClean: function (body) {
            return body;
        },
        afterPasteClean: function (body) {
            return body;
        },
        trackChangesButton: function () {},
        showChangesButton: function () {},
        acceptButton: function () {},
        rejectButton: function () {},
        acceptAllButton: function () {},
        rejectAllButton: function () {},

        /**
         * Plugin initialization - register buttons, commands, and take care of setup.
         */
        init: function (ed, url) {
            var self = this, changeEditor = null;

            ed.handleEvents = function(e) {
                if (ed.changeEditor !== undefined){
                    return ed.changeEditor.handleEvent(e);
                }
            };

            ed.on('mouseup mousedown keydown keyup keypress', function (e) {
                return ed.handleEvents(e);
            });

            /**
             * After the editor renders, initialize ice.
             */
            ed.on('postrender', function (e) {
                var dom = ed.dom;

                tinymce.extend(self, ed.getParam('ice'));
                self.insertSelector = '.' + self.insertClass;
                self.deleteSelector = '.' + self.deleteClass;

                // Add insert and delete tag/attribute rules.
                // Important: keep `id` in attributes list in case `insertTag` is a `span` - tinymce uses temporary spans with ids.
                ed.serializer.addRules(self.insertTag + '[id|class|title|' + self.changeIdAttribute + '|' + self.userIdAttribute + '|' + self.userNameAttribute + '|' + self.timeAttribute + ']');
                ed.serializer.addRules(self.deleteTag + '[id|class|title|' + self.changeIdAttribute + '|' + self.userIdAttribute + '|' + self.userNameAttribute + '|' + self.timeAttribute + ']');
                // Temporary tags to act as placeholders for deletes.
                ed.serializer.addRules('tempdel[data-allocation]');

                if (!self.ice_loaded_externally) {
                    tinymce.ScriptLoader.load(url + self.path_to_ice_js, ed.execCommand('initializeice'));
                } else {
                    ed.execCommand('initializeice');
                }

                // Setting the trackChanges button to whatever isTracking was set on initialisation
                ed.plugins.ice.trackChangesButton.active(self.isTracking);
                // always show changes on startup in case there was previous changeds
                ed.plugins.ice.showChangesButton.active(true);
            });

            /**
             * Instantiates a new ice instance using the given `editor` or the current editor body.
             * TODO/FIXME: There is some timing conflict that forces us to initialize ice after a
             * timeout (maybe mce isn't completely initialized???). Research further...
             */
            ed.addCommand('initializeice', function (editor) {
                ed = editor || ed;
                tinymce.DOM.win.setTimeout(function () {
                    // Protect against leaving the page before the timeout fires. Happens in automated testing.
                    if (ed.getDoc() === null){
                        return;
                    }
                    
                    ed.changeEditor = new ice.InlineChangeEditor({
                        element: ed.getBody(),
                        isTracking: self.isTracking,
                        contentEditable: self.contentEditable,
                        changeIdAttribute: self.changeIdAttribute,
                        userIdAttribute: self.userIdAttribute,
                        userNameAttribute: self.userNameAttribute,
                        timeAttribute: self.timeAttribute,
                        titleDateFormat: self.titleDateFormat,
                        mergeBlocks: self.mergeBlocks,
                        currentUser: {
                            id: self.user.id,
                            name: self.user.name
                        },
                        plugins: [
                            'IceEmdashPlugin',
                            'IceAddTitlePlugin',
                            'IceSmartQuotesPlugin',
                            {
                                name: 'IceCopyPastePlugin',
                                settings: {
                                    pasteType: 'formattedClean',
                                    preserve: self.preserveOnPaste,
                                    beforePasteClean: self.beforePasteClean,
                                    afterPasteClean: self.afterPasteClean
                                }
                            }
                        ],
                        changeTypes: {
                            insertType: {tag: self.insertTag, alias: self.insertClass},
                            deleteType: {tag: self.deleteTag, alias: self.deleteClass}
                        }
                    }).startTracking();

                    setTimeout(function () {
                        self.afterInit.call(self);
                    }, 10);
                }, 500);
            });

            /**
             * Re-initializes ice's environment - resets the environment variables for the current page
             * and re-initializes the internal ice range. This is useful after tinymce hides/switches
             * the current editor, like when toggling to the html source view and back.
             */
            ed.addCommand('ice_initenv', function () {
                ed.changeEditor.initializeEnvironment();
                ed.changeEditor.initializeRange();
            });

            /**
             * Cleans change tracking tags out of the given, or editor, body. Removes deletes and their
             * inner contents; removes insert tags, keeping their inner content in place.
             * @param el optional html string or node body.
             * @return clean body, void of change tracking tags.
             */
            ed.addCommand('icecleanbody', function (el) {
                return ed.changeEditor.getCleanContent(el || ed.getContent(), self.afterClean, self.beforeClean);
            });

            /**
             * Returns true if delete placeholders are in place; otherwise, false.
             */
            ed.addCommand('ice_hasDeletePlaceholders', function () {
                return ed.changeEditor.isPlaceholdingDeletes;
            });

            /**
             * This command will drop placeholders in place of delete tags in the editor body and
             * store away the references which can be reverted back with the `ice_removeDeletePlaceholders`.
             */
            ed.addCommand('ice_addDeletePlaceholders', function () {
                return ed.changeEditor.placeholdDeletes();
            });

            /**
             * Replaces delete placeholders with their respective delete nodes.
             */
            ed.addCommand('ice_removeDeletePlaceholders', function () {
                return ed.changeEditor.revertDeletePlaceholders();
            });

            /**
             * Insert content with change tracking tags.
             *
             * The `insert` object parameter can contain the following properties:
             *   { `item`, `range` }
             * Where `item` is the item to insert (string, or textnode)
             * and `range` is an optional range to insert into.
             */
            ed.addCommand('iceinsert', function (insert) {
                insert = insert || {};
                ed.changeEditor.insert(insert.item, insert.range);
            });

            /**
             * Deletes content with change tracking tags.
             *
             * The `del` object parameter can contain the following properties:
             *   { `right`, `range` }
             * Where `right` is an optional boolean parameter, where true deletes to the right, false to the left
             * and `range` is an optional range to delete in.
             *
             * If the current Selection isn't collapsed then the `right` param is ignored
             * and a selection delete is performed.
             */
            ed.addCommand('icedelete', function (del) {
                del = del || {};
                ed.changeEditor.deleteContents(del.right, del.range);
            });

            /**
             * Set the current ice user with the incoming `user`.
             */
            ed.addCommand('ice_changeuser', function (user) {
                ed.changeEditor.setCurrentUser(user);
            });

            /**
             * Uses the given `node` or finds the current node where the selection resides, and in the
             * case of a delete tag, removes the node, or in the case of an insert, removes the outer
             * insert tag and keeps the contents in place.
             */
            ed.addCommand('iceaccept', function (node) {
                ed.undoManager.add();
                ed.changeEditor.acceptChange(node || ed.selection.getNode());
                cleanup();
            });

            /**
             * Uses the given `node` or finds the current node where the selection resides, and in the
             * case of a delete tag, removes the outer delete tag and keeps the contents in place, or
             * in the case of an insert, removes the node.
             */
            ed.addCommand('icereject', function (node) {
                ed.undoManager.add();
                ed.changeEditor.rejectChange(node || ed.selection.getNode());
                cleanup();
            });

            /**
             * Cleans the editor body of change tags - removes delete nodes, and removes outer insert
             * tags keeping the inner content in place. Defers to cleaning technique.
             */
            ed.addCommand('iceacceptall', function () {
                ed.undoManager.add();
                ed.changeEditor.acceptAll();
                cleanup();
            });

            /**
             * Cleans the editor body of change tags - removes inserts, and removes outer delete tags,
             * keeping the inner content in place.
             */
            ed.addCommand('icerejectall', function () {
                ed.undoManager.add();
                ed.changeEditor.rejectAll();
                cleanup();
            });

            /**
             * Adds a class to the editor body which will toggle, hide or show, track change styling.
             */
            ed.addCommand('ice_toggleshowchanges', function () {
                var body = ed.getBody(), disabled = true;

                if (ed.dom.hasClass(body, 'CT-hide')) {
                    //activate show changes button
                    ed.plugins.ice.showChangesButton.active(true);
                    ed.dom.removeClass(body, 'CT-hide');
                    disabled = false;
                } else {
                    //deactivate show changes button
                    ed.plugins.ice.showChangesButton.active(false);
                    ed.dom.addClass(body, 'CT-hide');
                }

                //toggle button disabling
                ed.plugins.ice.acceptAllButton.disabled(disabled);
                ed.plugins.ice.rejectAllButton.disabled(disabled);
                ed.plugins.ice.acceptButton.disabled(disabled);
                ed.plugins.ice.rejectButton.disabled(disabled);

                ed.execCommand('mceRepaint');
            });

            /**
             * Calls the ice smart quotes plugin to convert regular quotes to smart quotes.
             */
            ed.addCommand('ice_smartquotes', function (quiet) {
                ed.changeEditor.pluginsManager.plugins['IceSmartQuotesPlugin'].convert(ed.getBody());
                if (!quiet) ed.windowManager.alert('Regular quotes have been converted into smart quotes.');
            });

            /**
             * Toggle change tracking on or off. Delegates to ice_enable or ice_disable.
             */
            ed.addCommand('ice_togglechanges', function () {
                if (ed.changeEditor.isTracking) {
                    ed.execCommand('ice_disable');
                } else {
                    ed.execCommand('ice_enable');
                }
            });

            /**
             * Turns change tracking on - ice will handle incoming key events.
             */
            ed.addCommand('ice_enable', function () {
                ed.changeEditor.enableChangeTracking();
                //toggle buttons and call show changes
                ed.plugins.ice.trackChangesButton.active(true);
                self.isTracking = true;
            });

            /**
             * Turns change tracking off - ice will be present but it won't listen
             * or act on events.
             */
            ed.addCommand('ice_disable', function () {
                //hide changes and toggle buttons
                ed.changeEditor.disableChangeTracking();
                ed.plugins.ice.trackChangesButton.active(false);
                self.isTracking = false;
            });

            /**
             * Returns 1 if ice is handling events and tracking changes; otherwise, 0.
             */
            ed.addCommand('ice_isTracking', function () {
                return ed.changeEditor.isTracking ? 1 : 0;
            });

            /**
             * Calls the copy-paste ice plugin to strip tags and attributes out of the given `html`.
             */
            ed.addCommand('ice_strippaste', function (html) {
                return ed.changeEditor.pluginsManager.plugins['IceCopyPastePlugin'].stripPaste(html);
            });

            /**
             * Makes a manual call to the paste handler - this feature is only useful when `isTracking`
             * is false; otherwise, ice will automatically handle paste events.
             */
            ed.addCommand('ice_handlepaste', function (html) {
                return ed.changeEditor.pluginsManager.plugins['IceCopyPastePlugin'].handlePaste();
            });

            /**
             * Makes a manual call to the emdash handler - this feature is only useful when `isTracking`
             * is false and the emdash plugin is not on; otherwise, ice will handle emdash conversion.
             */
            ed.addCommand('ice_handleemdash', function (html) {
                return ed.changeEditor.pluginsManager.plugins['IceEmdashPlugin'].convertEmdash() ? 1 : 0;
            });

            /**
             * Register Buttons
             */
            ed.addButton('iceaccept', {
                title: 'Accept Change',
                image: url + '/img/accept.gif',
                cmd: 'iceaccept',
                onPostRender: function () { //assigns button and changes disabled status on node change
                    var self = this;
                    ed.plugins.ice.acceptButton = self;
                    ed.plugins.ice.acceptButton.disabled = self.disabled;

                    ed.on('NodeChange', function (e) {
                        if (isInsideChangeTag(e.element)) {
                            self.disabled(false);
                        } else {
                            self.disabled(true);
                        }
                    });
                }
            });

            ed.addButton('icereject', {
                title: 'Reject Change',
                image: url + '/img/reject.gif',
                cmd: 'icereject',
                onPostRender: function () {//assigns button and changes disabled status on node change
                    var self = this;
                    ed.plugins.ice.rejectButton = self;
                    ed.plugins.ice.rejectButton.disabled = self.disabled;

                    ed.on('NodeChange', function (e) {
                        if (isInsideChangeTag(e.element)) {
                            self.disabled(false);
                        } else {
                            self.disabled(true);
                        }
                    });
                }
            });

            ed.addButton('iceacceptall', {
                title: 'Accept All Changes',
                image: url + '/img/ice-accept.png',
                cmd: 'iceacceptall',
                onPostRender: function () { //assigns button
                    var self = this;
                    ed.plugins.ice.acceptAllButton = self;
                    ed.plugins.ice.acceptAllButton.disabled = self.disabled;
                }
            });

            ed.addButton('icerejectall', {
                title: 'Reject All Changes',
                image: url + '/img/ice-reject.png',
                cmd: 'icerejectall',
                onPostRender: function () { //assigns button
                    var self = this;
                    ed.plugins.ice.rejectAllButton = self;
                    ed.plugins.ice.rejectAllButton.disabled = self.disabled;
                }
            });

            ed.addButton('ice_toggleshowchanges', {
                title: 'Show/Hide Track Changes',
                image: url + '/img/ice-showchanges.png',
                onclick: function () {
                    ed.fire('ice_toggleshowchanges');
                    ed.execCommand('ice_toggleshowchanges');
                },
                onPostRender: function () { //assigns button
                    var self = this;
                    ed.plugins.ice.showChangesButton = self;
                    ed.plugins.ice.showChangesButton.disabled = self.disabled;
                    ed.plugins.ice.showChangesButton.active = self.active;
                }
            });

            ed.addButton('ice_smartquotes', {
                title: 'Convert quotes to smart quotes',
                'class': 'mce_blockquote',
                cmd: 'ice_smartquotes'
            });

            ed.addButton('ice_togglechanges', {
                title: 'Toggle Track Changes ',
                image: url + '/img/ice-togglechanges.png',
                cmd: 'ice_togglechanges',
                onPostRender: function () { //assigns button
                    var self = this;
                    ed.plugins.ice.trackChangesButton = self;
                    ed.plugins.ice.trackChangesButton.disabled = self.disabled;
                    ed.plugins.ice.trackChangesButton.active = self.active;
                }
            });

            if (ed.plugins.contextmenu) {
                ed.plugins.contextmenu.onContextMenu.add(function (th, menu, node) {
                    if (isInsideChangeTag(node)) {
                        menu.add({
                            title: "Accept Change",
                            icon: 'accept',
                            cmd: 'iceaccept'
                        });
                        menu.add({
                            title: "Reject Change",
                            icon: 'reject',
                            cmd: 'icereject'
                        });
                    }
                });
            }

            /**
             * Node Change event - watch for node changes and toggle buttons.
             */
            ed.on('NodeChange', function (e) {
                if (isInsideChangeTag(e.element)) {
                    ed.plugins.ice.acceptButton.disabled(false);
                    ed.plugins.ice.rejectButton.disabled(false);
                } else {
                    ed.plugins.ice.acceptButton.disabled(true);
                    ed.plugins.ice.rejectButton.disabled(true);
                }
                cleanup();
            });

            /**
             * Private Methods
             */

            function isInsideChangeTag(n) {
                return !!ed.dom.getParent(n, self.insertSelector + ',' + self.deleteSelector);
            }

            function cleanup() {
                var empty = ed.dom.select(self.insertSelector + ':empty,' + self.deleteSelector + ':empty');
                ed.dom.remove(empty);
                // Browsers insert breaks into empty paragraphs as a space holder - clean that up
                // Not playing nice with Webkit...
                /*tinymce.each(ed.dom.select('br'), function(br, i) {
                 var p = ed.dom.getParent(br, 'p');
                 if(p && (p.innerText || p.textContent) !== '')
                 ed.dom.remove(br);
                 });*/
            }

        }
    });

    tinymce.PluginManager.add('ice', tinymce.plugins.IcePlugin);
})();
