namespace AplicacionWebMap.Models
{
    public class Usuario
    {
        public long Id { get; set; }
        public string Nombre { get; set; }
        public long Telefono { get; set; }
        public int Rol { get; set; }
        public string Correo { get; set; }
        public string Password { get; set; }


    }
}
