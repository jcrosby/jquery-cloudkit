//------------------------------------------------------------------------------
//
// jquery.cloudkit.js source
//
// Copyright (c) 2008, 2009 Jon Crosby http://joncrosby.me
//
// For the complete source with the patched/bundled TaffyDB dependency,
// run 'rake dist' and use the contents of the dist directory.
//
//------------------------------------------------------------------------------

(function($) {

  $.cloudkit = $.cloudkit || {};

  //----------------------------------------------------------------------------
  // Private API
  //----------------------------------------------------------------------------

  var collectionURIs = []; // collection URIs found during boot via discovery
  var collections    = {}; // TaffyDB stores, one per remote resource collection
  var meta           = {}; // metadata for each local object

  // return a key that is unique across all local items
  var uniqueId = function() {
    return (new Date).getTime() + '-' + Math.floor(Math.random()*10000);
  };

  // load remote collection URIs
  var loadMeta = function(options) {
    $.ajax({
      type: 'GET',
      url: '/cloudkit-meta',
      complete: function(response, statusText) {
        data = TAFFY.JSON.parse(response.responseText);
        if (response.status == 200) {
          collectionURIs = data.uris;
          options.success();
        } else if (response.status >= 400) {
          options.error(response.status);
        } else {
          options.error('unexpected error');
        }
      }
    });
  };

  // configure a local collection
  var configureCollection = function(collection) {

    // set up TaffyDB
    name = collection.replace(/^\//, '');
    collections[name] = new TAFFY([]);
    collections[name].config.set('map', function(item) {
      delete item['___cloudkit_local_id___'];
    });

    // map insert to POST
    collections[name].onInsert = function(data, options) {
      $.ajax({
        type: 'POST',
        url: collection,
        data: TAFFY.JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        processData: false,
        complete: function(response, statusText) {
          localId = uniqueId();
          meta[localId] = TAFFY.JSON.parse(response.responseText);
          data['___cloudkit_local_id___'] = localId;
          if (response.status == 201) {
            options.success();
          } else {
            options.error(response.status);
          }
        }
      });
    };

    // map update to PUT
    collections[name].onUpdate = function(data, original, options) {
      localId = original['___cloudkit_local_id___'];
      metadata = meta[localId];
      $.ajax({
        type: 'PUT',
        url: metadata.uri,
        data: TAFFY.JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('If-Match', metadata.etag);
        },
        processData: false,
        complete: function(response, statusText) {
          meta[localId] = TAFFY.JSON.parse(response.responseText);
          data['___cloudkit_local_id___'] = localId;
          if (response.status == 200) {
            options.success();
          } else {
            options.error(response.status);
          }
        }
      });
    };

    // map remove to DELETE
    collections[name].onRemove = function(data, options) {
      localId = data['___cloudkit_local_id___'];
      metadata = meta[localId];
      $.ajax({
        type: 'DELETE',
        url: metadata.uri,
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('If-Match', metadata.etag);
        },
        processData: false,
        complete: function(response, statusText) {
          updated_metadata = TAFFY.JSON.parse(response.responseText);
          meta[localId] = updated_metadata;
          if (response.status == 200) {
            meta['deleted'] = true;
            options.success();
          } else {
            options.error(response.status);
          }
        }
      });
    };
  };

  // load remote data into local store
  var populateCollectionsFromRemote = function(index, options) {
    if (index == collectionURIs.length) {
      options.success();
      return;
    }
    $.ajax({
      type: 'GET',
      url: collectionURIs[index]+"/_resolved",
      dataType: 'json',
      processData: false,
      complete: function(response, statusText) {
        if (response.status == 200) {
          resources = TAFFY.JSON.parse(response.responseText).documents;
          name = collectionURIs[index].replace(/^\//, '');
          for (var i = 0; i < resources.length; i++) {
            resource = resources[i];
            localId = uniqueId();
            doc = TAFFY.JSON.parse(resource.document);
            doc['___cloudkit_local_id___'] = localId;
            collections[name].insertFromRemote(doc);
            meta[localId] = {
              uri: resource.uri,
              etag: resource.etag,
              last_modified: resource.last_modified
            };
          }
          options.success();
        } else {
          options.error(response.status);
        }
      }
    });
  };

  // extend jquery
  $.fn.extend($.cloudkit, {

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    // setup the local store
    boot: function(options) {
      collectionURIs = [];
      collections = [];
      meta = {};
      loadMeta({
        success: function() {
          $(collectionURIs).each(function(index, collection) {
            configureCollection(collection);
          });
          populateCollectionsFromRemote(0, {
            success: function() {
              options.success();
            },
            error: function(status) {
              options.error(status);
            }
          });
        },
        error: function(status) {
          options.error(status);
        }
      });
    },

    // return all TaffyDB collections
    collections: function() {
      return collections;
    },

    // return a specific TaffyDB collection
    collection: function(name) {
      return this.collections()[name];
    },

    // return the metadata for a given local ID
    metaObject: function(localId) {
      return meta[localId];
    }
  });
})(jQuery);
