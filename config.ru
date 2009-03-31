require 'cloudkit'

# Test-mode-only datastore reset middleware
# Clears store on POST to /test_reset
class TestResetMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    if match_route?(env)
      CloudKit.storage_adapter.clear
      [200, {'Content-Type' => 'text/html', 'Content-Length' => '2'}, ['OK']]
    else
      @app.call(env)
    end
  end

  def match_route?(env)
    env['PATH_INFO'] == '/test_reset' && env['REQUEST_METHOD'] == 'POST'
  end
end

expose :notes, :things # host RESTful "notes" and "things" JSON APIs
use TestResetMiddleware
use Rack::Static, :urls => ['/'] # serve the plugin and test files
run lambda { |env| [404, {'Content-Type' => 'text/html', 'Content-Length' => '9'}, ['Not Found']] } # appease rack
