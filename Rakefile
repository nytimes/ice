require 'rubygems'
require 'jammit'
require 'fileutils'

# 
# USAGE:
#   rake build
# With version parameter:
#   rake build[0.5.0]
#

# Think before you change - this directory is removed!!!
BUILDDIR = "dist" 
	
# Build with jammit. Copy the license to
# the top of the build file.
def build
	FileUtils.rm_rf BUILDDIR, :verbose => true
	
	Jammit.package!({
		:config_path   => "assets.yml",
		:output_folder => BUILDDIR
	})

	# copy the license to the top of the minified file
	icefile = BUILDDIR + "/ice.min.js"  
	File.open(BUILDDIR + "/temp.js","w") do |tempfile|
		tempfile.puts "/**\n" + File.read("LICENSE") + "\n**/"
		tempfile.puts File.read(icefile)
	end
	File.delete(icefile)
	FileUtils.mv BUILDDIR + "/temp.js", icefile
end

def confMCE
	# Create the mce plugins
	path = BUILDDIR + "/tinymce/plugins/"
	icepath = path + "ice/"
	srpath = path + "icesearchreplace/"
	FileUtils.mkdir_p path
	# Create the ice plugin
	FileUtils.cp_r "lib/tinymce/jscripts/tiny_mce/plugins/ice/", icepath, :verbose => true
	FileUtils.cp BUILDDIR + "/ice.min.js", icepath + 'js/', :verbose => true
	FileUtils.mv icepath + "editor_plugin.js", icepath + "editor_plugin_src.js", :verbose => true
	FileUtils.mv BUILDDIR + "/ice_editor_plugin.js", icepath + "editor_plugin.js", :verbose => true
	FileUtils.rm BUILDDIR + "/ice_editor_plugin.js.gz"
	# Create the icesearchreplace plugin
	FileUtils.cp_r "lib/tinymce/jscripts/tiny_mce/plugins/icesearchreplace/", srpath, :verbose => true
	FileUtils.mv srpath + "editor_plugin.js", srpath + "editor_plugin_src.js", :verbose => true
	FileUtils.mv BUILDDIR + "/sr_editor_plugin.js", srpath + "editor_plugin.js", :verbose => true
	FileUtils.rm BUILDDIR + "/sr_editor_plugin.js.gz"
end

def confWP
	# Create the WordPress plugin
	path = BUILDDIR + "/wp-plugin/mce-revisions/"
	iceMCEpath = BUILDDIR + '/tinymce/plugins/ice'
	FileUtils.mkdir_p path
	FileUtils.cp_r "wp-plugin/.", path + '.', :verbose => true
	FileUtils.cp_r iceMCEpath, path, :verbose => true
	FileUtils.cp "wp-plugin/ice/css/ice.css", path + "ice/css/", :verbose => true
end

desc "Build ice and mce plugins."
task :build, [:version] do |t, args|
	puts "Building version #{args.version} to #{BUILDDIR}/"
	build
	confMCE
	confWP
	# Zip it all up.
	system "zip -r #{BUILDDIR}/ice_#{args.version}.zip #{BUILDDIR}"
end
