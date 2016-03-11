using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Todo.Models
{
    public abstract class BaseModel
    {
        public int Id { get; set; }    
    }

    public class Policy : BaseModel
    {
        public string Name { get; set; }
        public DateTime EffDate { get; set; }
        public List<Vehicle> Vehicles { get; set; }
    }

    public class Vehicle : BaseModel
    {
        public string Name { get; set; }
        public int KmOneWay { get; set; }
        public List<Coverage> Coverages { get; set; }

        public virtual Policy Policy { get; set; }
    }

    public class Coverage : BaseModel
    {
        public string Name { get; set; }
        public decimal Premium { get; set; }

        public virtual Vehicle Vehicle { get; set; }
    }
}