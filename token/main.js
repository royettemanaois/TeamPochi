
var idbApp = (function() {
  'use strict';

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var dbPromise = idb.open('student-list', 5, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the students object store');
        upgradeDb.createObjectStore('students', {autoIncrement: true});
      case 2:
        console.log('Creating a id index');
        var store = upgradeDb.transaction.objectStore('students');
        store.createIndex('id', 'id', {unique: true});
      case 3:
        console.log('Creating lastname indexes');
        var store = upgradeDb.transaction.objectStore('students');
        store.createIndex('lastname', 'lastname');
      case 4:
        console.log('Creating the transaction object store');
        upgradeDb.createObjectStore('transaction', {keyPath: 'id'});
    }
  });

  function addStudents(results) {
    dbPromise.then(function(db) {
      var tx = db.transaction('students', 'readwrite');
      var store = tx.objectStore('students');
      var storeSize;

 
      var countRequest = store.count();
        countRequest.onsuccess = function() {
        storeSize = countRequest.result;
      }


      for(var x = 1; x <= storeSize; x++){
        var request = store.get(x);

        request.onsuccess = function(e) {
          var data = e.target.result;
          data.balance = 0;

          var objRequest = store.put(data,x);

          objRequest.onsuccess = function(e){
            console.log('Success in updating record');
          };
        };
      }


      var items = results;

      for(var x = 0; x < items.length; x++){
        items[x] = {"id":items[x].id, "lastname":items[x].lastname, "firstname":items[x].firstname, "course":items[x].course, "year":items[x].year, "balance":500};
      }

      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.add(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('All items added successfully!');
      });
    });
  }

 
  return {
    dbPromise: (dbPromise),
    addStudents: (addStudents)
  };
})();


function upload() {
    var file = $("#csvfile")[0].files[0];
    var json = Papa.parse(file, 
      {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          idbApp.addStudents(results.data);
        }
      });
}




























