/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.1.6 (2020-01-28)
 */
(function () {
    'use strict';

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var noop = function () {
    };
    var constant = function (value) {
      return function () {
        return value;
      };
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
    var never = constant(false);
    var always = constant(true);

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.XHR');

    var getCreationDateClasses = function (editor) {
      return editor.getParam('template_cdate_classes', 'cdate');
    };
    var getModificationDateClasses = function (editor) {
      return editor.getParam('template_mdate_classes', 'mdate');
    };
    var getSelectedContentClasses = function (editor) {
      return editor.getParam('template_selected_content_classes', 'selcontent');
    };
    var getPreviewReplaceValues = function (editor) {
      return editor.getParam('template_preview_replace_values');
    };
    var getTemplateReplaceValues = function (editor) {
      return editor.getParam('template_replace_values');
    };
    var getTemplates = function (editorSettings) {
      return editorSettings.templates;
    };
    var getCdateFormat = function (editor) {
      return editor.getParam('template_cdate_format', editor.translate('%Y-%m-%d'));
    };
    var getMdateFormat = function (editor) {
      return editor.getParam('template_mdate_format', editor.translate('%Y-%m-%d'));
    };
    var Settings = {
      getCreationDateClasses: getCreationDateClasses,
      getModificationDateClasses: getModificationDateClasses,
      getSelectedContentClasses: getSelectedContentClasses,
      getPreviewReplaceValues: getPreviewReplaceValues,
      getTemplateReplaceValues: getTemplateReplaceValues,
      getTemplates: getTemplates,
      getCdateFormat: getCdateFormat,
      getMdateFormat: getMdateFormat
    };

    var addZeros = function (value, len) {
      value = '' + value;
      if (value.length < len) {
        for (var i = 0; i < len - value.length; i++) {
          value = '0' + value;
        }
      }
      return value;
    };
    var getDateTime = function (editor, fmt, date) {
      var daysShort = 'Sun Mon Tue Wed Thu Fri Sat Sun'.split(' ');
      var daysLong = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ');
      var monthsShort = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
      var monthsLong = 'January February March April May June July August September October November December'.split(' ');
      date = date || new Date();
      fmt = fmt.replace('%D', '%m/%d/%Y');
      fmt = fmt.replace('%r', '%I:%M:%S %p');
      fmt = fmt.replace('%Y', '' + date.getFullYear());
      fmt = fmt.replace('%y', '' + date.getYear());
      fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2));
      fmt = fmt.replace('%d', addZeros(date.getDate(), 2));
      fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2));
      fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2));
      fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2));
      fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1));
      fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? 'AM' : 'PM'));
      fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]));
      fmt = fmt.replace('%b', '' + editor.translate(monthsShort[date.getMonth()]));
      fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]));
      fmt = fmt.replace('%a', '' + editor.translate(daysShort[date.getDay()]));
      fmt = fmt.replace('%%', '%');
      return fmt;
    };
    var DateTimeHelper = { getDateTime: getDateTime };

    var createTemplateList = function (editorSettings, callback) {
      return function () {
        var templateList = Settings.getTemplates(editorSettings);
        if (typeof templateList === 'function') {
          templateList(callback);
          return;
        }
        if (typeof templateList === 'string') {
          global$2.send({
            url: templateList,
            success: function (text) {
              callback(JSON.parse(text));
            }
          });
        } else {
          callback(templateList);
        }
      };
    };
    var replaceTemplateValues = function (html, templateValues) {
      global$1.each(templateValues, function (v, k) {
        if (typeof v === 'function') {
          v = v(k);
        }
        html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
      });
      return html;
    };
    var replaceVals = function (editor, e) {
      var dom = editor.dom, vl = Settings.getTemplateReplaceValues(editor);
      global$1.each(dom.select('*', e), function (e) {
        global$1.each(vl, function (v, k) {
          if (dom.hasClass(e, k)) {
            if (typeof vl[k] === 'function') {
              vl[k](e);
            }
          }
        });
      });
    };
    var hasClass = function (n, c) {
      return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
    };
    var insertTemplate = function (editor, ui, html) {
      var el;
      var n;
      var dom = editor.dom;
      var sel = editor.selection.getContent();
      html = replaceTemplateValues(html, Settings.getTemplateReplaceValues(editor));
      el = dom.create('div', null, html);
      n = dom.select('.mceTmpl', el);
      if (n && n.length > 0) {
        el = dom.create('div', null);
        el.appendChild(n[0].cloneNode(true));
      }
      global$1.each(dom.select('*', el), function (n) {
        if (hasClass(n, Settings.getCreationDateClasses(editor).replace(/\s+/g, '|'))) {
          n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getCdateFormat(editor));
        }
        if (hasClass(n, Settings.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
          n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getMdateFormat(editor));
        }
        if (hasClass(n, Settings.getSelectedContentClasses(editor).replace(/\s+/g, '|'))) {
          n.innerHTML = sel;
        }
      });
      replaceVals(editor, el);
      editor.execCommand('mceInsertContent', false, el.innerHTML);
      editor.addVisual();
    };
    var Templates = {
      createTemplateList: createTemplateList,
      replaceTemplateValues: replaceTemplateValues,
      replaceVals: replaceVals,
      insertTemplate: insertTemplate
    };

    var register = function (editor) {
      editor.addCommand('mceInsertTemplate', curry(Templates.insertTemplate, editor));
    };
    var Commands = { register: register };

    var setup = function (editor) {
      editor.on('PreProcess', function (o) {
        var dom = editor.dom, dateFormat = Settings.getMdateFormat(editor);
        global$1.each(dom.select('div', o.node), function (e) {
          if (dom.hasClass(e, 'mceTmpl')) {
            global$1.each(dom.select('*', e), function (e) {
              if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
                e.innerHTML = DateTimeHelper.getDateTime(editor, dateFormat);
              }
            });
            Templates.replaceVals(editor, e);
          }
        });
      });
    };
    var FilterContent = { setup: setup };

    var none = function () {
      return NONE;
    };
    var NONE = function () {
      var eq = function (o) {
        return o.isNone();
      };
      var call = function (thunk) {
        return thunk();
      };
      var id = function (n) {
        return n;
      };
      var me = {
        fold: function (n, s) {
          return n();
        },
        is: never,
        isSome: never,
        isNone: always,
        getOr: id,
        getOrThunk: call,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        getOrNull: constant(null),
        getOrUndefined: constant(undefined),
        or: id,
        orThunk: call,
        map: none,
        each: noop,
        bind: none,
        exists: never,
        forall: always,
        filter: none,
        equals: eq,
        equals_: eq,
        toArray: function () {
          return [];
        },
        toString: constant('none()')
      };
      if (Object.freeze) {
        Object.freeze(me);
      }
      return me;
    }();
    var some = function (a) {
      var constant_a = constant(a);
      var self = function () {
        return me;
      };
      var bind = function (f) {
        return f(a);
      };
      var me = {
        fold: function (n, s) {
          return s(a);
        },
        is: function (v) {
          return a === v;
        },
        isSome: always,
        isNone: never,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        getOrNull: constant_a,
        getOrUndefined: constant_a,
        or: self,
        orThunk: self,
        map: function (f) {
          return some(f(a));
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        },
        equals: function (o) {
          return o.is(a);
        },
        equals_: function (o, elementEq) {
          return o.fold(never, function (b) {
            return elementEq(a, b);
          });
        }
      };
      return me;
    };
    var from = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };
    var Option = {
      some: some,
      none: none,
      from: from
    };

    var typeOf = function (x) {
      if (x === null) {
        return 'null';
      }
      var t = typeof x;
      if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
        return 'array';
      }
      if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
        return 'string';
      }
      return t;
    };
    var isType = function (type) {
      return function (value) {
        return typeOf(value) === type;
      };
    };
    var isFunction = isType('function');

    var nativeSlice = Array.prototype.slice;
    var map = function (xs, f) {
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i);
      }
      return r;
    };
    var find = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          return Option.some(x);
        }
      }
      return Option.none();
    };
    var from$1 = isFunction(Array.from) ? Array.from : function (x) {
      return nativeSlice.call(x);
    };

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.Promise');

    var hasOwnProperty = Object.hasOwnProperty;
    var get = function (obj, key) {
      return has(obj, key) ? Option.from(obj[key]) : Option.none();
    };
    var has = function (obj, key) {
      return hasOwnProperty.call(obj, key);
    };

    var entitiesAttr = {
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '\'': '&#039;'
    };
    var htmlEscape = function (html) {
      return html.replace(/["'<>&]/g, function (match) {
        return get(entitiesAttr, match).getOr(match);
      });
    };

    var getPreviewContent = function (editor, html) {
      if (html.indexOf('<html>') === -1) {
        var contentCssLinks_1 = '';
        global$1.each(editor.contentCSS, function (url) {
          contentCssLinks_1 += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">';
        });
        var bodyClass = editor.settings.body_class || '';
        if (bodyClass.indexOf('=') !== -1) {
          bodyClass = editor.getParam('body_class', '', 'hash');
          bodyClass = bodyClass[editor.id] || '';
        }
        var encode = editor.dom.encode;
        var directionality = editor.getBody().dir;
        var dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';
        html = '<!DOCTYPE html>' + '<html>' + '<head>' + contentCssLinks_1 + '</head>' + '<body class="' + encode(bodyClass) + '"' + dirAttr + '>' + html + '</body>' + '</html>';
      }
      return Templates.replaceTemplateValues(html, Settings.getPreviewReplaceValues(editor));
    };
    var open = function (editor, templateList) {
      var createTemplates = function () {
        if (!templateList || templateList.length === 0) {
          var message = editor.translate('No templates defined.');
          editor.notificationManager.open({
            text: message,
            type: 'info'
          });
          return Option.none();
        }
        return Option.from(global$1.map(templateList, function (template, index) {
          var isUrlTemplate = function (t) {
            return t.url !== undefined;
          };
          return {
            selected: index === 0,
            text: template.title,
            value: {
              url: isUrlTemplate(template) ? Option.from(template.url) : Option.none(),
              content: !isUrlTemplate(template) ? Option.from(template.content) : Option.none(),
              description: template.description
            }
          };
        }));
      };
      var createSelectBoxItems = function (templates) {
        return map(templates, function (t) {
          return {
            text: t.text,
            value: t.text
          };
        });
      };
      var findTemplate = function (templates, templateTitle) {
        return find(templates, function (t) {
          return t.text === templateTitle;
        });
      };
      var getTemplateContent = function (t) {
        return new global$3(function (resolve, reject) {
          t.value.url.fold(function () {
            return resolve(t.value.content.getOr(''));
          }, function (url) {
            return global$2.send({
              url: url,
              success: function (html) {
                resolve(html);
              },
              error: function (e) {
                reject(e);
              }
            });
          });
        });
      };
      var onChange = function (templates, updateDialog) {
        return function (api, change) {
          if (change.name === 'template') {
            var newTemplateTitle = api.getData().template;
            findTemplate(templates, newTemplateTitle).each(function (t) {
              api.block('Loading...');
              getTemplateContent(t).then(function (previewHtml) {
                updateDialog(api, t, previewHtml);
                api.unblock();
              });
            });
          }
        };
      };
      var onSubmit = function (templates) {
        return function (api) {
          var data = api.getData();
          findTemplate(templates, data.template).each(function (t) {
            getTemplateContent(t).then(function (previewHtml) {
              Templates.insertTemplate(editor, false, previewHtml);
              api.close();
            });
          });
        };
      };
      var openDialog = function (templates) {
        var selectBoxItems = createSelectBoxItems(templates);
        var buildDialogSpec = function (bodyItems, initialData) {
          return {
            title: 'Insert Template',
            size: 'large',
            body: {
              type: 'panel',
              items: bodyItems
            },
            initialData: initialData,
            buttons: [
              {
                type: 'cancel',
                name: 'cancel',
                text: 'Cancel'
              },
              {
                type: 'submit',
                name: 'save',
                text: 'Save',
                primary: true
              }
            ],
            onSubmit: onSubmit(templates),
            onChange: onChange(templates, updateDialog)
          };
        };
        var updateDialog = function (dialogApi, template, previewHtml) {
          var content = getPreviewContent(editor, previewHtml);
          var bodyItems = [
            {
              type: 'selectbox',
              name: 'template',
              label: 'Templates',
              items: selectBoxItems
            },
            {
              type: 'htmlpanel',
              html: '<p aria-live="polite">' + htmlEscape(template.value.description) + '</p>'
            },
            {
              label: 'Preview',
              type: 'iframe',
              name: 'preview',
              sandboxed: false
            }
          ];
          var initialData = {
            template: template.text,
            preview: content
          };
          dialogApi.unblock();
          dialogApi.redial(buildDialogSpec(bodyItems, initialData));
          dialogApi.focus('template');
        };
        var dialogApi = editor.windowManager.open(buildDialogSpec([], {
          template: '',
          preview: ''
        }));
        dialogApi.block('Loading...');
        getTemplateContent(templates[0]).then(function (previewHtml) {
          updateDialog(dialogApi, templates[0], previewHtml);
        });
      };
      var optTemplates = createTemplates();
      optTemplates.each(openDialog);
    };
    var Dialog = { open: open };

    var showDialog = function (editor) {
      return function (templates) {
        Dialog.open(editor, templates);
      };
    };
    var register$1 = function (editor) {
      editor.ui.registry.addButton('template', {
        icon: 'template',
        tooltip: 'Insert template',
        onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
      });
      editor.ui.registry.addMenuItem('template', {
        icon: 'template',
        text: 'Insert template...',
        onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
      });
    };
    var Buttons = { register: register$1 };

    function Plugin () {
      global.add('template', function (editor) {
        Buttons.register(editor);
        Commands.register(editor);
        FilterContent.setup(editor);
      });
    }

    Plugin();

}());
