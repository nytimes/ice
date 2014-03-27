/*jshint unused:false */
/*global tinymce:true */

tinymce.PluginManager.add('chocobo', function(editor) {
	var self = this;
	
	self.user = {
		username: "Curt M",
		userId: 6
	};

	editor.on('init', function(e) {
		
	});
			
			
	editor.on('keydown', function(e) {
		// handle delete key
		if (e.keyCode == 46) {
			//e.preventDefault();
			
			// get the selection
			var c = editor.selection.getContent();
			alert(c);
		}
		
				
	    // handle backspace key
		if(e.keyCode == 8)
        {
            //e.preventDefault();
			
        }
		
		
	});

});