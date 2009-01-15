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
  taffy  = File.read('vendor/taffy-1.6.1-patched.js')
  plugin = "#{taffy}\n\n#{source}"
  File.open('dist/jquery.cloudkit.js', 'w') { |io| io.write(plugin) }
  File.open('dist/jquery.cloudkit.min.js', 'w') { |io| io.write(JSMin.minify(plugin)) }
  puts "Complete"
  puts
  puts "Check the dist directory for development and minified versions of the plugin."
end
