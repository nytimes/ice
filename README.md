# ice.js

Ice is a track changes implementation, built in javascript, for anything that is `contenteditable` on the web. Conceived by the CMS Group at The New York Times, ice has been piloting successfully for articles written in the newsroom.

## Features

- Track multi-user inserts and deletes with the option to turn on and off tracking or highlighting.
- A robust API to accept and reject changes, get clean content, and add a lot of configuration.
- Plugins for tinymce and wordpress.
- Optional plugins to track copy-cut-pasting, convert smart quotes, and create em-dashes.

## Get Started

**_Contenteditable initialization_** - If you are comfortable with maintaining your own text editing utilities, then you can initialize ice on any block element:

     var tracker = new ice.InlineChangeEditor({
       // element to track - ice will make it contenteditable
       element: document.getElementById('mytextelement'),
       // tell ice to setup/handle events on the `element`
       handleEvents: true,
       // set a user object to associate with each change
       currentUser: { id: 1, name: 'Miss T' }
     });

Additional options and post-init callback:

     var tracker = new ice.InlineChangeEditor({
       element: document.getElementById('mytextelement'),
       handleEvents: true,
       currentUser: { id: 1, name: 'Miss T' },
       // optional plugins
       plugins: [
         // Add title attributes to changes for hover info
         'IceAddTitlePlugin',
         // Two successively typed dashes get converted into an em-dash
         'IceEmdashPlugin',
         // Track content that is cut and pasted
         {
           name: 'IceCopyPastePlugin',
           settings: {
             // List of tags and attributes to preserve when cleaning a paste
             preserve: 'p,a[href],span[id,class]em,strong'
           }
         }
       ]
     }, function() { console.log('ice post-init callback') });


Useful utilities in the API:

     // Accept/Reject the change at the current range/cursor position or at the given `optionalNode`
     tracker.acceptChange(optionalNode);
     tracker.rejectChange(optionalNode);

     // Accept/Reject all of the changes in the editable region.
     tracker.acceptAll();
     tracker.rejectAll();

     // Returns a clean version, without tracking tags, of the content in the editable element or out of the optional `body` param. After cleaning, the `optionalCallback` param is called which should further modify and return the body.
     tracker.getCleanContent(optionalBody, optionalCallback);

**_Tinymce initialization_** - Add the ice plugin to your tinymce plugins directory and include the following in your tinymce init:

      tinymce.init({
        plugins: 'ice',
        theme_advanced_buttons1: 'ice_togglechanges,ice_toggleshowchanges,iceacceptall,icerejectall,iceaccept,icereject',
        ice: {
          user: { name: 'Miss T', id: 1},
          preserveOnPaste: 'p,a[href],i,em,strong',
					// Optional param - defaults to the css found in the plugin directory
					css: 'http://example.com/custom.css'
        },
        ...
      });

**_Wordpress initialization_**

     In testing - more to come soon.

## Limitations/Dependencies

- ice depends on jQuery. We will be working to remove this dependency at some point.
- ice was originally created for the simple markup behind nytimes.com articles (`p`, `a`, `em`, `strong`). As such, it requires that all text editing takes place in a common root block element, and that there are no other blocks found in the editor. Any type of inline elements are ok, inside of the common root blocks. 
- Unfortunately, we haven't been able to test this across all browsers and versions. We know that it tests well in modern Firefox (5+) and Webkit browsers, and "seems to work" in IE7+. We intend to do more testing and get a better idea about what ice can support across browsers, shortly.

## Please Help

In the coming months we will be adding documentation, known issues to the tracker, more unit testing, more plugins, and more features. This is a big task and we would love some help.

## License

[GPL](http://github.com/nytd/ice/blob/master/LICENSE)
