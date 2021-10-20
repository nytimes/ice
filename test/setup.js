$(document).ready(function() {

  // Setup a general function for ice construction
  window.getIce = function(el) {
    el.attr('contentEditable', true);
    $('#qunit-fixture').append(el);
    return new ice.InlineChangeEditor({
      element: el[0],
      isTracking: true,
      changeIdAttribute: 'data-cid',
      userIdAttribute: 'data-userid',
      userNameAttribute: 'data-username',
      timeAttribute: 'data-time',
      currentUser: { id: '4', name: 'Ted' },
      preserveOnPaste: 'p,a[href],i,em,strong,span',
      mergeBlocks: false,
      styleColorsNumber: 12,
      classNotTracked: null,
      changeTypes : {
        insertType: {tag: 'span', alias: 'ins' },
        deleteType: {tag: 'span', alias: 'del' }
      },
      plugins: [
        'IceAddTitlePlugin',
        'IceSmartQuotesPlugin',
        { name: 'IceCopyPastePlugin', settings: { preserve: 'p,a[href],strong[*],em[id|class]' }}
      ]
    }).startTracking();
  };
});
