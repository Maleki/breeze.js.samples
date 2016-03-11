namespace Todo.Models {
    using System.Data.Entity;

    public class TodosContext : DbContext 
    {
        // DEVELOPMENT ONLY: initialize the database
        static TodosContext()
        {
            Database.SetInitializer(new TodoDatabaseInitializer());
        }
        public DbSet<TodoItem> Todos { get; set; }
        public DbSet<Policy> Policies { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Coverage> Coverages { get; set; }

    }
}