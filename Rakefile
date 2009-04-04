require 'jsmin'

task :default => :test

desc 'run test suite'
task :test do
  gem 'cloudkit', '>=0.10.0'
  system('open http://localhost:9292/test/test.html')
  system('rackup config.ru')
end

desc 'prepare files for release'
task :dist do
  FileUtils.rm_rf('dist')
  FileUtils.mkdir('dist')
  source = File.read('jquery.cloudkit.js')
  json_util = File.read('vendor/json2.js')
  json_query = File.read('vendor/query.js')
  plugin = "#{json_util}\n\n#{json_query}\n\n#{source}"
  File.open('dist/jquery.cloudkit.js', 'w') { |io| io.write(plugin) }
  File.open('dist/jquery.cloudkit.min.js', 'w') { |io| io.write(JSMin.minify(plugin)) }
  puts "Complete"
  puts
  puts "Check the dist directory for development and minified versions of the plugin."
end

# JSONQuery.js is pulled from the fork at jcrosby/jsonquery on GitHub
desc 'pull in external jsonquery dependency'
task :dep do
  FileUtils.cp('../jsonquery/JSONQuery.js', 'vendor/query.js')
end
