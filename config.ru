require 'cloudkit'
expose :notes, :things # host RESTful "notes" and "things" JSON APIs
use Rack::Static, :urls => ['/'] # serve the plugin and test files
run lambda { |env| [404, {'Content-Type' => 'text/html', 'Content-Length' => '9'}, ['Not Found']] } # appease rack
