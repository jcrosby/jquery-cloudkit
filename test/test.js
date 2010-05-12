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

test('boot', function() {
  resetRemote();
  expect(4);
  stop();
  store.boot({
    success: function() {
      ok(store.collections().hasOwnProperty('notes'), "There must be a notes collection");
      ok(store.collections().hasOwnProperty('things'), "There must be a things collection");
      ok(store.collection('notes'), "The notes collection must be directly accessible");
      ok(store.collection('things'), "The things collection must be directly accessible");
      start();
    }
  });
});

test('boot with existing data', function() {
  resetRemote();
  expect(2);
  stop();
  postData('notes', {'foo':'bar'});
  postData('notes', {'foo':'baz'});
  postData('things', {'a':'b'});
  store.boot({
    success: function() {
      ok(store.collection('notes').all().length == 2, "Booting should load the notes collection data");
      ok(store.collection('things').all().length == 1, "Booting should load the things collection data");
      start();
    }
  });
});

test('create', function() {
  resetRemote();
  expect(4);
  stop();
  store.boot({
    success: function() {
      store.collection('things').create({name:"box"}, {
        success: function(resource) {
          ok(!(typeof resource === 'undefined'), "Creating a resource should return the resource");
          ok(!(typeof resource.id() === 'undefined'), "The resource should have an ID");
          store.collection('things').create({name:"book"}, {
            success: function(inner_resource) {
              ok(store.collection('things').all().length == 2, "The store should have two items after the second create operation");
              var result = JSON.parse(
                $.ajax({
                  type: 'GET',
                  url: '/things',
                  async: false
                }).responseText
              ).total;
              ok(result == 2, "The store should POST to the remote store");
              start();
            }
          });
        }
      });
    }
  });
});

test('get', function() {
  resetRemote();
  expect(1);
  stop();
  store.boot({
    success: function() {
      store.collection('things').create({name:"box", color:"red"}, {
        success: function(resource) {
          store.collection('things').create({name:"book", color:"black"}, {
            success: function(inner_resource) {
              ok('book' == store.collection('things').get(inner_resource.id()).json().name, "The get method should return the correct object");
              start();
            }
          });
        }
      });
    }
  });
});

test('update', function() { // TODO test for proper resource update/metadata sync
  resetRemote();
  expect(1);
  stop();
  store.boot({
    success: function() {
      store.collection('things').create({name:"box", color:"red"}, {
        success: function(resource) {
          resource.update({name:"boxen"}, {
            success: function() {
              ok('boxen' == store.collection('things').get(resource.id()).json().name, "The update method should update the object");
              start();
            }
          });
        }
      });
    }
  });
});

test('destroy', function() {
  resetRemote();
  expect(3);
  stop();
  store.boot({
    success: function() {
      store.collection('things').create({name:"box", color:"red"}, {
        success: function(resource) {
          resource.destroy({
            success: function() {
              ok(0 == store.collection('things').all().length, "The destroy method should remove the object");
              var result = $.ajax({
                type: 'GET',
                url: resource.uri(),
                async: false
              });
              ok(410 == result.status, "The destroy method should remove the remote resource");
              ok(true == resource.isDeleted(), "The destroy method should mark the resource as deleted");
              start();
            }
          });
        }
      });
    }
  });
});

test('jsonquery', function() {
  resetRemote();
  expect(2);
  stop();
  store.boot({
    success: function() {
      store.collection('things').create({name:'foo',rating:3}, {
        success: function(resource) {
          store.collection('things').create({name:'bar',rating:2}, {
            success: function(inner_resource) {
              result = store.collection('things').query("?name='bar'");
              ok(1 == result.length, "The = operator should return the correct number of results");
              ok('bar' == result[0].json().name, "The = operator should return the correct resource");
              start();
            }
          });
        }
      });
    }
  });
});
