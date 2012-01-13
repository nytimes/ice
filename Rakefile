require 'rubygems'
require 'jammit'

desc "minify gettit source with jammit"
task :minify do
	Jammit.package!({
		:config_path   => "assets.yml",
		:output_folder => "./"
	})
end

desc "create docco docs with rocco"
task :docs do
	%x[rocco gettit.js ; mv gettit.html docs/]
end

