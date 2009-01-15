var tests = function($) {

  var store = jQuery.cloudkit; // TODO clear the existing objects on the server

  jqUnit.test('boot', function() { // TODO add test for loading existing objects
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

  jqUnit.test('insert', function() {
    jqUnit.expect(3);
    jqUnit.stop();
    store.boot({
      success: function() {
        collection_size = store.collection('things').get().length;
        store.collection('things').insert({name:"box"}, {
          success: function(index) {
            jqUnit.ok(index == collection_size, "The first insert should return an index equal to the existing collection size");
            store.collection('things').insert({name:"book"}, {
              success: function(index) {
                jqUnit.ok(index == collection_size+1, "The second insert should return an index that is 1 more then the previous index");
                jqUnit.ok(store.collection('things').get().length == collection_size+2, "The store should have two more items that it had after booting");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('get', function() {
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').insert({name:"box", color:"red"}, {
          success: function(index) {
            store.collection('things').insert({name:"book", color:"black"}, {
              success: function(index) {
                jqUnit.ok('book' == store.collection('things').get({color:"black"})[0].name, "The get method should return the correct object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('update', function() {
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').insert({name:"box", color:"red"}, {
          success: function(index) {
            store.collection('things').update({name:"boxen"}, {
              success: function(indexes) {
                jqUnit.ok('boxen' == store.collection('things').get({color:"red"})[0].name, "The update method should update the object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

  jqUnit.test('delete', function() {
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        collection_size = store.collection('things').get().length;
        store.collection('things').insert({name:"box", color:"red"}, {
          success: function() {
            store.collection('things').remove({name:"box"}, {
              success: function() {
                jqUnit.ok(collection_size == store.collection('things').get().length, "The remove method should remove the object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

}(jQuery);
