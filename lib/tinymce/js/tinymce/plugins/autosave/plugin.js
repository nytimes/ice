/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.1.6 (2020-01-28)
 */
(function (domGlobals) {
    'use strict';

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      var clone = function () {
        return Cell(get());
      };
      return {
        get: get,
        set: set,
        clone: clone
      };
    };

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Delay');

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.LocalStorage');

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var fireRestoreDraft = function (editor) {
      return editor.fire('RestoreDraft');
    };
    var fireStoreDraft = function (editor) {
      return editor.fire('StoreDraft');
    };
    var fireRemoveDraft = function (editor) {
      return editor.fire('RemoveDraft');
    };

    var parse = function (timeString, defaultTime) {
      var multiples = {
        s: 1000,
        m: 60000
      };
      var toParse = timeString || defaultTime;
      var parsedTime = /^(\d+)([ms]?)$/.exec('' + toParse);
      return (parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(toParse, 10);
    };

    var shouldAskBeforeUnload = function (editor) {
      return editor.getParam('autosave_ask_before_unload', true);
    };
    var getAutoSavePrefix = function (editor) {
      var prefix = editor.getParam('autosave_prefix', 'tinymce-autosave-{path}{query}{hash}-{id}-');
      prefix = prefix.replace(/\{path\}/g, domGlobals.document.location.pathname);
      prefix = prefix.replace(/\{query\}/g, domGlobals.document.location.search);
      prefix = prefix.replace(/\{hash\}/g, domGlobals.document.location.hash);
      prefix = prefix.replace(/\{id\}/g, editor.id);
      return prefix;
    };
    var shouldRestoreWhenEmpty = function (editor) {
      return editor.getParam('autosave_restore_when_empty', false);
    };
    var getAutoSaveInterval = function (editor) {
      return parse(editor.settings.autosave_interval, '30s');
    };
    var getAutoSaveRetention = function (editor) {
      return parse(editor.settings.autosave_retention, '20m');
    };

    var isEmpty = function (editor, html) {
      var forcedRootBlockName = editor.settings.forced_root_block;
      html = global$3.trim(typeof html === 'undefined' ? editor.getBody().innerHTML : html);
      return html === '' || new RegExp('^<' + forcedRootBlockName + '[^>]*>((\xA0|&nbsp;|[ \t]|<br[^>]*>)+?|)</' + forcedRootBlockName + '>|<br>$', 'i').test(html);
    };
    var hasDraft = function (editor) {
      var time = parseInt(global$2.getItem(getAutoSavePrefix(editor) + 'time'), 10) || 0;
      if (new Date().getTime() - time > getAutoSaveRetention(editor)) {
        removeDraft(editor, false);
        return false;
      }
      return true;
    };
    var removeDraft = function (editor, fire) {
      var prefix = getAutoSavePrefix(editor);
      global$2.removeItem(prefix + 'draft');
      global$2.removeItem(prefix + 'time');
      if (fire !== false) {
        fireRemoveDraft(editor);
      }
    };
    var storeDraft = function (editor) {
      var prefix = getAutoSavePrefix(editor);
      if (!isEmpty(editor) && editor.isDirty()) {
        global$2.setItem(prefix + 'draft', editor.getContent({
          format: 'raw',
          no_events: true
        }));
        global$2.setItem(prefix + 'time', new Date().getTime().toString());
        fireStoreDraft(editor);
      }
    };
    var restoreDraft = function (editor) {
      var prefix = getAutoSavePrefix(editor);
      if (hasDraft(editor)) {
        editor.setContent(global$2.getItem(prefix + 'draft'), { format: 'raw' });
        fireRestoreDraft(editor);
      }
    };
    var startStoreDraft = function (editor, started) {
      var interval = getAutoSaveInterval(editor);
      if (!started.get()) {
        global$1.setInterval(function () {
          if (!editor.removed) {
            storeDraft(editor);
          }
        }, interval);
        started.set(true);
      }
    };
    var restoreLastDraft = function (editor) {
      editor.undoManager.transact(function () {
        restoreDraft(editor);
        removeDraft(editor);
      });
      editor.focus();
    };

    function curry(fn) {
      var initialArgs = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        initialArgs[_i - 1] = arguments[_i];
      }
      return function () {
        var restArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          restArgs[_i] = arguments[_i];
        }
        var all = initialArgs.concat(restArgs);
        return fn.apply(null, all);
      };
    }

    var get = function (editor) {
      return {
        hasDraft: curry(hasDraft, editor),
        storeDraft: curry(storeDraft, editor),
        restoreDraft: curry(restoreDraft, editor),
        removeDraft: curry(removeDraft, editor),
        isEmpty: curry(isEmpty, editor)
      };
    };

    var global$4 = tinymce.util.Tools.resolve('tinymce.EditorManager');

    var setup = function (editor) {
      editor.editorManager.on('BeforeUnload', function (e) {
        var msg;
        global$3.each(global$4.get(), function (editor) {
          if (editor.plugins.autosave) {
            editor.plugins.autosave.storeDraft();
          }
          if (!msg && editor.isDirty() && shouldAskBeforeUnload(editor)) {
            msg = editor.translate('You have unsaved changes are you sure you want to navigate away?');
          }
        });
        if (msg) {
          e.preventDefault();
          e.returnValue = msg;
        }
      });
    };

    var makeSetupHandler = function (editor, started) {
      return function (api) {
        api.setDisabled(!hasDraft(editor));
        var editorEventCallback = function () {
          return api.setDisabled(!hasDraft(editor));
        };
        editor.on('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
        return function () {
          return editor.off('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
        };
      };
    };
    var register = function (editor, started) {
      startStoreDraft(editor, started);
      editor.ui.registry.addButton('restoredraft', {
        tooltip: 'Restore last draft',
        icon: 'restore-draft',
        onAction: function () {
          restoreLastDraft(editor);
        },
        onSetup: makeSetupHandler(editor)
      });
      editor.ui.registry.addMenuItem('restoredraft', {
        text: 'Restore last draft',
        icon: 'restore-draft',
        onAction: function () {
          restoreLastDraft(editor);
        },
        onSetup: makeSetupHandler(editor)
      });
    };

    function Plugin () {
      global.add('autosave', function (editor) {
        var started = Cell(false);
        setup(editor);
        register(editor, started);
        editor.on('init', function () {
          if (shouldRestoreWhenEmpty(editor) && editor.dom.isEmpty(editor.getBody())) {
            restoreDraft(editor);
          }
        });
        return get(editor);
      });
    }

    Plugin();

}(window));
