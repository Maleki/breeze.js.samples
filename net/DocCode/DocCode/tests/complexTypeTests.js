﻿// ReSharper disable InconsistentNaming
(function(testFns) {
  "use strict";

  //////// Breeze configuration and module setup ///////////

  // convenience variables
  var EntityState = breeze.EntityState;
  var handleFail = testFns.handleFail;

  var ajaxAdapter;
  var fooType;      // set by createFooType
  var locationType; // set by createFooType
  var origModelLib;
  var serviceName = 'dummyService';

  module("complexTypeTests", {
    setup: setup,
    teardown: teardown
  });

  function setup() {
    ajaxAdapter = breeze.config.getAdapterInstance('ajax');
    ajaxAdapter.requestInterceptor = defaultAjaxInterceptor;
    // switch to backingStore
    origModelLib = breeze.config.getAdapterInstance('modelLibrary').name;
    breeze.config.initializeAdapterInstance('modelLibrary', 'backingStore');
  }
  function teardown() {
    ajaxAdapter.requestInterceptor = null;
    // restore "original" modelLibrary
    breeze.config.initializeAdapterInstance('modelLibrary', origModelLib);
  }

  //////// Tests ///////////
  test("can create Foo entity w/ complexType properties", function() {
    expect(1);
    var em = newEm();
    var todo = createNewFoo(em);

    ok(todo !== null, 'the new Foo id is '+ todo.id);
  });

  asyncTest("can fake query for a Foo", function () {
    expect(1);
    var em = newEm();

    ajaxAdapter.requestInterceptor = interceptor;

    breeze.EntityQuery.from('Foos')
      .using(em).execute()
      .then(success).catch(handleFail).finally(start);

    function success(data) {
      var foo = data.results[0] || {};
      ok(foo.entityType !== null, 'got faked Foos');
    }

    function interceptor(requestInfo) {
      requestInfo.config = null; // by-pass the real service
      var result = getOneFooQueryResult();
      requestInfo.success(result.data, result.statusText, result.jqXHR);
    }
  });

  // D#2672 second query of same entity w/ ComplexType array triggers hasChanges
  // http://stackoverflow.com/questions/29394871/breeze-issue-with-complextype-change-tracking
  asyncTest("2nd query of same object does NOT trigger hasChanges", function () {
    expect(2);
    var em = newEm();

    ajaxAdapter.requestInterceptor = interceptor;

    var query = breeze.EntityQuery.from('Foos')
    var queryCount = 0;

    query.using(em).execute()
      .then(requery)
      .then(success)
      .catch(handleFail).finally(start);

    function requery(data) {
      equal(em.hasChanges(), false, 'hasChanges is false after 1st query');
      return query.using(em).execute();
    }

    function success(data) {
      var foo = data.results[0] || {};
      equal(em.hasChanges(), false, 'hasChanges is false after 2nd query');
    }

    function interceptor(requestInfo) {
      queryCount++;
      requestInfo.config = null; // by-pass the real service
      var result = getOneFooQueryResult();
      requestInfo.success(result.data, result.statusText, result.jqXHR);
    }
  });

  ////// helpers //////////

  function createMetadataStore() {

    var DT = breeze.DataType;

    fooType = new breeze.EntityType({
      shortName: 'Foo',
      namespace: 'Model',
      autoGeneratedKeyType: breeze.AutoGeneratedKeyType.Identity,
      defaultResourceName: 'Foos',

      dataProperties: {
        id: { dataType: DT.Int32, isPartOfKey: true },
        name: {},
        colors: { isScalar: false }, // an array of strings
        // complex types: an array and a single value
        locations: { complexTypeName: "Location:#Model", isNullable: false, isScalar: false },
        primeLocation: { complexTypeName: "Location:#Model", isNullable: false, isScalar: true }
      }
    });

    locationType  = new breeze.ComplexType({
      shortName: "Location",
      namespace: 'Model',

      dataProperties: {
        address: { maxLength: 60 },
        city: { maxLength: 15 },
        region: { maxLength: 15 },
        postalCode: { maxLength: 10 },
        country: { maxLength: 15 }
      }
    });

    var ds = new breeze.DataService({
      serviceName: serviceName,
      hasServerMetadata: false
    });

    var store = new breeze.MetadataStore({
      namingConvention: breeze.NamingConvention.camelCase
    });

    store.addDataService(ds);
    store.addEntityType(fooType);
    store.addEntityType(locationType);

    return store;
  }

  function createNewFoo(em, init, entityState) {

    var primeLoc = { address: '123 Main St', city: 'Smallville' };
    var loc1 = { address: '456 Funky St', city: 'Happy Town' };
    var loc2 = { address: '6001 Shellmound St', city: 'Emeryville', region: 'CA', postalCode: '94608' };

    var initDefault = {
      name: 'New Foo',
      colors: ['red', 'green', 'blue'],
      locations: [loc1, loc2],
      primeLocation: primeLoc
    }
    return em.createEntity('Foo',
      breeze.core.extend(initDefault, init || {}), entityState);
  }

  function defaultAjaxInterceptor(requestInfo) {
    throw new Error('made a server request w/o permission');
  }

  function jqXHR(status, headers, responseText) {
    this.status = status;
    this.getResponseHeader = function (headerName) {
      return headers[headerName] || null;
    };
    this.getAllResponseHeaders = function () {
      return headers;
    };
    this.responseText = responseText;
  }

  // fake query result returning one Foo
  function getOneFooQueryResult() {
    return {
      data: [{
        "$id": "1",
        "$type": "Foo, Model",
        "Id": "42",
        "Name": "Big Kahuna",
        "Colors": ["Blue", "Yellow"],
        "PrimeLocation": {
          "$id": "2",
          "$type": "Location, Model",
          "Address": "555 Park Ave",
          "City": "NYC",
          "Region": "NY"
        },
        "Locations": [{
          "$id": "3",
          "$type": "Location, Model",
          "Address": "555 Park Ave",
          "City": "NYC",
          "Region": "NY"
        }]
        //"Locations": [{ "$ref": "2" }] // doesn't work. Todo: find out why
      }],

      statusText: "200 OK",
      jqXHR: new jqXHR(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": 1200
      })
    };
  }

  function newEm() {
    return new breeze.EntityManager({
      serviceName: serviceName,
      metadataStore: createMetadataStore()
    });
  }

})(docCode.testFns);