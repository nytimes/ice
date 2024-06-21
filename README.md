# ice.js

Ice is a track changes implementation, built in javascript, for anything that is `contenteditable` on the web. Conceived by the CMS Group at The New York Times, ice is powering the editor used for writing articles in the newsroom.

## Demo

[Try it](https://nytimes.github.io/ice/demo/)

## Download

[v0.5.0](http://nytimes.github.com/ice/downloads/ice_0.5.0.zip)

## Features

- Track multi-user inserts and deletes with the option to turn on and off tracking or highlighting.
- A robust API to accept and reject changes, get clean content, and add a lot of configuration.
- Plugins for tinymce and wordpress.
- Optional plugins to track copy-cut-pasting, convert smart quotes, and create em-dashes.

## Get Started

***

**_Contenteditable initialization_** - If you are comfortable with maintaining your own text editing utilities, then you can initialize ice on any block element:
```javascript
     var tracker = new ice.InlineChangeEditor({
       // element to track - ice will make it contenteditable
       element: document.getElementById('mytextelement'),
       // tell ice to setup/handle events on the `element`
       handleEvents: true,
       // set a user object to associate with each change
       currentUser: { id: 1, name: 'Miss T' }
     });
     // setup and start event handling for track changes
     tracker.startTracking();
```
Additional options:
```javascript
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
     }).startTracking();
```
***

**_Useful utilities in the API:_**
     
**acceptChange, rejectChange**
```javascript
     // Accept/Reject the change at the current range/cursor position or at the given `optionalNode`
     tracker.acceptChange(optionalNode);
     tracker.rejectChange(optionalNode);
```
**acceptAll, rejectAll**
```javascript
     // Accept/Reject all of the changes in the editable region.
     tracker.acceptAll();
     tracker.rejectAll();
```
**getCleanContent**
```javascript
     // Returns a clean version, without tracking tags, of the content in the editable element or
     // out of the optional `body` param. After cleaning, the `optionalCallback` param is called
     // which should further modify and return the body.
     tracker.getCleanContent(optionalBody, optionalCallback);
```
**setCurrentUser**
```javascript
     // Set the desired user to track. A user object has the following properties: { `id`, `name` }.
     tracker.setCurrentUser({id: 2, name: 'Miss T'});
```
**getChanges**
```javascript
     // Get the internal list of change objects which are modeled from all of the change tracking
     // nodes in the DOM. This might be useful to add a more sophisticated change tracking UI/UX.
     // The list is key'ed with the unique change ids (`cid attribute`) and points to an object
     // with metadata for a change: [changeid] => {`type`, `time`, `userid`, `username`}
     var changes = tracker.getChanges();
```
***

**_Tinymce initialization_** - Add the ice plugin to your tinymce plugins directory and include the following in your tinymce init:
```javascript
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
```
***

## Limitations/Dependencies

- ice needs to be initialized after the DOM ready event fires.
- Wordpress support is limited. We need contribution from any willing WordPress developers.
- Browser support is limited to Firefox (5+) and Webkit browsers, and minimal support for IE8+.

## Changelog

### Master

- Fixes bug where Webkit browsers were throwing errors when the letter "v" was pressed. 

### 0.5.0

- Fixes cut, copy, paste for Firefox and Webkit browsers.
- Fixes delete tracking in webkit browsers.

## License

[GPL 2.0](https://github.com/NYTimes/ice/blob/master/LICENSE)
