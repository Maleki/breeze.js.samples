﻿(function (ko, breeze, datacontext) {
    
    // Extract Breeze metadata definition types
    var DT        = breeze.DataType;
    var ID        = breeze.DataType.Int32;
    var KEYTYPE   = breeze.AutoGeneratedKeyType.Identity;
    var Validator = breeze.Validator;

    // The empty metadataStore to which we add types
    var store = datacontext.metadataStore;
    addTodoItemType(store);
    addTodoListType(store);

    // Type definitions

    function addTodoItemType() {
        store.addEntityType({
            shortName: "TodoItem",
            namespace: "NoDb.Models",
            autoGeneratedKeyType: KEYTYPE,
            dataProperties: {
                todoItemId: { dataType: ID, isNullable: false, isPartOfKey: true },
                title: {
                    maxLength: 30, isNullable: false,
                    // Add client-side validation to 'title'
                    validators: [ Validator.required(), Validator.maxLength( {maxLength: 30})]      
                },
                isDone: { dataType: DT.Boolean,  isNullable: false },
                todoListId: { dataType: ID, isNullable: false }
            },
            navigationProperties: {
                // returns a single parent TodoList and associates with TodoList.Todos
                todoList: { entityTypeName: "TodoList", isScalar: true, foreignKeyNames: ["todoListId"],  associationName: "TodoList_Items" } 
            }
        });

        store.registerEntityTypeCtor("TodoItem", null, todoItemInitializer);

        function todoItemInitializer(todoItem) {
            // add unpersisted, untracked properties for UI purposes
            todoItem.errorMessage = ko.observable();
        }
    }

   
    function addTodoListType() {
        store.addEntityType({
            shortName: "TodoList",
            namespace: "NoDb.Models",
            autoGeneratedKeyType: KEYTYPE,
            dataProperties: {
                todoListId: { dataType: ID, isNullable: false, isPartOfKey: true },
                title:      { maxLength: 30, isNullable: false }
            },
            navigationProperties: {
                // returns a collection of TodoItems -- associates with TodoItem.TodoList
                todos: { entityTypeName: "TodoItem", isScalar: false, associationName: "TodoList_Items" }
            }
        });

        var TodoList = function () {
            this.title = "My todos";
        };

        TodoList.prototype.addTodo = function () {
            var title = this.newTodoTitle();
            if (title) {
                var todoItem = datacontext.createTodoItem({
                    title: title,
                    todoListId: this.todoListId() // setting FK works
                    //todoList: this // App binding fails !?!

                    /* Setting the navigation property fails although it should work
                     * Breeze appears to be doing the right thing but 
                     * appears that a KO timing issue screws up binding of todoList todos.
                     * Setting the FK instead as done here or setting nav prop after creation
                     * works fine. Go figure.
                     */
                });
                datacontext.saveNewTodoItem(todoItem);
                this.newTodoTitle("");
            }
        };

        TodoList.prototype.deleteTodo = function () {
            // KO ensures that "this" is the TodoItem, not the TodoList!
            return datacontext.deleteTodoItem(this);
        };

        store.registerEntityTypeCtor("TodoList", TodoList, todoListInitializer);

        function todoListInitializer(todoList) {
            // add unpersisted, untracked properties for UI purposes
            todoList.errorMessage = ko.observable();
            todoList.isEditingListTitle = ko.observable(false);
            todoList.newTodoTitle = ko.observable();
        }
    }



})(ko, breeze, todoApp.datacontext);

