using System;
using System.Collections.Generic;
using System.Data.Entity;

namespace Todo.Models
{
    // DEMONSTRATION/DEVELOPMENT ONLY
    public class TodoDatabaseInitializer:
        DropCreateDatabaseAlways<TodosContext> // re-creates every time the server starts
        //DropCreateDatabaseIfModelChanges<TodosContext> 
    {
        protected override void Seed(TodosContext context)
        {
            SeedDatabase(context);
        }

        public static void SeedDatabase(TodosContext context)
        {
            _baseCreatedAtDate = new DateTime(2012, 8, 22, 9, 0, 0);

            var todos = new[] {
                // Description, IsDone, IsArchived
                CreateTodo("Food", true, true),
                CreateTodo("Water", true, true),
                CreateTodo("Shelter", true, true),
                CreateTodo("Bread", false, false),
                CreateTodo("Cheese", true, false),
                CreateTodo("Wine", false, false)
           };

            Array.ForEach(todos, t => context.Todos.Add(t));
            
            Policy policy = new Policy
            {
                Name = "Pol1",
                EffDate = DateTime.Now,
                Vehicles = new List<Vehicle>{
                    new Vehicle
                        {
                            Name = "Ford",
                            KmOneWay = 100,
                            Coverages = new List<Coverage>{
                                new Coverage
                                    {
                                        Name = "Coverage1",
                                        Premium = 100
                                    },
                                    new Coverage
                                    {
                                        Name = "Coverage2",
                                        Premium = 200
                                    }
                            }
                        },
                        new Vehicle
                        {
                            Name = "Toyota",
                            KmOneWay = 222,
                            Coverages = new List<Coverage>{
                                new Coverage
                                    {
                                        Name = "Coverage3",
                                        Premium = 111
                                    },
                                    new Coverage
                                    {
                                        Name = "Coverage3",
                                        Premium = 222
                                    }
                            }
                        }
                }
            };
            context.Policies.Add(policy);
            context.SaveChanges(); // Save 'em
        }

        private static TodoItem CreateTodo(
            string description, bool isDone, bool isArchived)
        {
            _baseCreatedAtDate = _baseCreatedAtDate.AddMinutes(1);
            return new TodoItem
            {
                CreatedAt = _baseCreatedAtDate,
                Description = description,
                IsDone = isDone,
                IsArchived = isArchived
            };
        }

        private static DateTime _baseCreatedAtDate;

        public static void PurgeDatabase(TodosContext context)
        {
            var todos = context.Todos;
            foreach (var todoItem in todos)
            {
                todos.Remove(todoItem);
            }

            context.SaveChanges();
        }

    }


}