# gettit.js

Where jammit falls in love with javascript.

## Jamming Off Rails

[jammit](http://documentcloud.github.com/jammit/) provides the ability to package, concatenate and compress javascript and CSS resources and allows you to pre cache assets by using the eponymous utility. However, to take advantage of the packaging and templating facilities the application has to be running in a Rails environment. This is where gettit comes in.

With gettit, you can take advantage of all the jammit goodness - configuration/assets definition, packaging based on environment, debug mode, etc - but without Rails. In place of Rails templating, gettit uses a single script tag for configuration so it should work in any framework/environment.

### Docs

[documentation](http://delambo.github.com/gettit/)
[annotated source](http://delambo.github.com/gettit/docs/annotated/)

### Download

[development version 0.3.0](http://delambo.github.com/gettit/downloads/gettit.js)
[production version 0.3.0](http://delambo.github.com/gettit/downloads/gettit.min.js)

## Usage

### Example Script Tag

The following is an example script that would be included on a page (static, dynamically injected, or possibly generated/templated):

     <script type = "text/javascript" 
             src = "gettit.js"
             data-assets = "assets.yml"
             data-js-assets = "js/core.js, js/common.js, js/util.js"
             data-css-assets = "css/core.css, css/common.css"
             data-env = "production"
             data-env-path = "http://example.com/assets/"
             data-callback = "window.test"
     ></script>

### Example Jammit Assets File

The following is an example (the corresponding) assets.yml file you would use for dependency management and building in jammit:

     package_assets: on 
     compress_assets: on
     template_function: _.template
     javascript_compressor: closure

     javascripts:
       core:
         - js/model/content.js
         - js/template/content.jst
       common:
         - js/common/string.js
         - js/common/template/menu.jst
       util:
         - js/util/extensions.js

     stylesheets:
       common:
         - css/common/style.css
       core:
         - css/content/style.css

## Script Attributes API

### data-assets

Path to the jammit assets config file, relative to the `data-env-path`, if it exists, or it can be a full url.

### data-js-assets

Comma-delimited list of paths to the packaged js files, relative to the path in `data-env-path`, if it exists, or they can be full urls.

### data-css-assets

Comma-delimited list of paths to the packaged css files, relative to the path in `data-env-path`, if it exists, or they can be full urls.

### data-env

Environment - development or production - which determines how gettit loads. In development, gettit will load files listed under the packages in the assets.yml individually, and will compile any javascript templates. In production, gettit will load the asset packages listed in the `data-js-assets` and `data-css-assets`.

### data-env-path

Optional path/uri to be prepended to package paths in `data-js-assets`, `data-css-assets`, and the assets config file defined in `data-assets`.

### data-callback 

Evaluated as a function after gettit fully loads the js and css packages.

## Debugging

As defined by jammit, gettit will respect the `debug_assets=true` url param-value when loading in production, and load the individual assets instead of the packages.

## Under The Hood

The script include will call on the gettit library, which when executed, refers back to its script include to read the initialization parameters ('data-' attributes) and start the load.  Based on the `data-env` attribute, if it is set to 'production', then gettit immediately uses an embedded script loader (lab.js) to load in parallel the static, pre-minified packages listed in `data-js-assets` and `data-css-assets`; otherwise, if the evironment is 'development', then gettit fetches the jammit assets.yml file, parses the yaml for the correct packages (the files named in the production load) and loads each of the individual scripts.  Also, in production, if you leave a debug_assets=true in the url, then gettit will load in development mode (similar to the feature of jammit).

So, loading in production should be essentially the same as using a script loader like [lab.js](http://labjs.com/), where you have to initially include the script loader, then script load in parallel any dependencies/packages (which should be minified ahead of time). As such, gettit isn't going to get you record speeds, but the same pattern gettit uses is fast enough for production environments and is being used by major sites in production.

There isn't too much new here - this is exactly how jammit works by itself in a rails environment (without JS loading), and [jawr](http://jawr.java.net/) does something similar for J2EE environments (without javascript template support - bummer!). The main, but essential difference, is that gettit isn't restricted to a particular environment/framework, all the while providing most of the features of jammit.

## Compatibility

### Cross-Domain Requests

If assets are fetched cross-domain in production _when using debug mode_, or in development, then CORS support is required on the server that houses the assets.

### Browser Support

Browser support is the same as [lab.js support](http://labjs.com/documentation.php), unless files in production and/or development are being fetched cross-domain, which requires CORS support, and [mostly affects IE, requiring version 8+](http://caniuse.com/cors).

### Limitations

Unfortunately, you can't use glob rules in the jammit configuration/assets file because gettit wouldn't know how to expand the patterns for fetching files and paths. I appologize in advance for all of your time, explicitly listing asset files.

## License

MIT
