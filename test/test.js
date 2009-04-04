var tests = function($) {

  var resetRemote = function() {
    $.ajax({
      type: 'POST',
      url: '/test_reset',
      async: false
    });
  };

  var postData = function(collection, data) {
    $.ajax({
      type: 'POST',
      url: '/'+collection,
      data: JSON.stringify(data),
      async: false
    });
  };

  var store = jQuery.cloudkit;

  jqUnit.test('boot', function() {
    resetRemote();
    jqUnit.expect(4);
    jqUnit.stop();
    store.boot({
      success: function() {
        jqUnit.ok(store.collections().hasOwnProperty('notes'), "There must be a notes collection");
        jqUnit.ok(store.collections().hasOwnProperty('things'), "There must be a things collection");
        jqUnit.ok(store.collection('notes'), "The notes collection must be directly accessible");
        jqUnit.ok(store.collection('things'), "The things collection must be directly accessible");
        jqUnit.start();
      }
    });
  });

  jqUnit.test('boot with existing data', function() {
    resetRemote();
    jqUnit.expect(2);
    jqUnit.stop();
    postData('notes', {'foo':'bar'});
    postData('notes', {'foo':'baz'});
    postData('things', {'a':'b'});
    store.boot({
      success: function() {
        jqUnit.ok(store.collection('notes').all().length == 2, "Booting should load the notes collection data");
        jqUnit.ok(store.collection('things').all().length == 1, "Booting should load the things collection data");
        jqUnit.start();
      }
    });
  });

  jqUnit.test('create', function() {
    resetRemote();
    jqUnit.expect(4);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').create({name:"box"}, {
          success: function(resource) {
            jqUnit.ok(!(typeof resource === 'undefined'), "Creating a resource should return the resource");
            jqUnit.ok(!(typeof resource.id() === 'undefined'), "The resource should have an ID");
            store.collection('things').create({name:"book"}, {
              success: function(inner_resource) {
                jqUnit.ok(store.collection('things').all().length == 2, "The store should have two items after the second create operation");
                var result = JSON.parse(
                  $.ajax({
                    type: 'GET',
                    url: '/things',
                    async: false
                  }).responseText
                ).total;
                jqUnit.ok(result == 2, "The store should POST to the remote store");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('get', function() {
    resetRemote();
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').create({name:"box", color:"red"}, {
          success: function(resource) {
            store.collection('things').create({name:"book", color:"black"}, {
              success: function(inner_resource) {
                jqUnit.ok('book' == store.collection('things').get(inner_resource.id()).json().name, "The get method should return the correct object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('update', function() { // TODO test for proper resource update/metadata sync
    resetRemote();
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').create({name:"box", color:"red"}, {
          success: function(resource) {
            resource.update({name:"boxen"}, {
              success: function() {
                jqUnit.ok('boxen' == store.collection('things').get(resource.id()).json().name, "The update method should update the object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('destroy', function() {
    resetRemote();
    jqUnit.expect(3);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').create({name:"box", color:"red"}, {
          success: function(resource) {
            resource.destroy({
              success: function() {
                jqUnit.ok(0 == store.collection('things').all().length, "The destroy method should remove the object");
                var result = $.ajax({
                  type: 'GET',
                  url: resource.uri(),
                  async: false
                });
                jqUnit.ok(410 == result.status, "The destroy method should remove the remote resource");
                jqUnit.ok(true == resource.isDeleted(), "The destroy method should mark the resource as deleted");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('jsonquery', function() {
    resetRemote();
    jqUnit.expect(2);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').create({name:'foo',rating:3}, {
          success: function(resource) {
            store.collection('things').create({name:'bar',rating:2}, {
              success: function(inner_resource) {
                result = store.collection('things').query("?name='bar'");
                jqUnit.ok(1 == result.length, "The = operator should return the correct number of results");
                jqUnit.ok('bar' == result[0].json().name, "The = operator should return the correct resource");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

}(jQuery);
