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
      data: TAFFY.JSON.stringify(data),
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
        jqUnit.ok(store.collection('notes').get().length == 2, "Booting should load the notes collection data");
        jqUnit.ok(store.collection('things').get().length == 1, "Booting should load the things collection data");
        jqUnit.start();
      }
    });
  });

  jqUnit.test('insert', function() { // TODO test that CloudKit has the resource
    resetRemote();
    jqUnit.expect(3);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').insert({name:"box"}, {
          success: function(index) {
            jqUnit.ok(index == 0, "The first insert should return the proper index from TaffyDB");
            store.collection('things').insert({name:"book"}, {
              success: function(index) {
                jqUnit.ok(index == 1, "The second insert should return an index of 1");
                jqUnit.ok(store.collection('things').get().length == 2, "The store should have two items after booting");
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

  jqUnit.test('update', function() { // TODO test for proper resource update/metadata sync
    resetRemote();
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

  jqUnit.test('delete', function() { // TODO test for 410 from CloudKit
    resetRemote();
    jqUnit.expect(1);
    jqUnit.stop();
    store.boot({
      success: function() {
        store.collection('things').insert({name:"box", color:"red"}, {
          success: function() {
            store.collection('things').remove({name:"box"}, {
              success: function() {
                jqUnit.ok(0 == store.collection('things').get().length, "The remove method should remove the object");
                jqUnit.start();
              }
            });
          }
        });
      }
    });
  });

}(jQuery);
