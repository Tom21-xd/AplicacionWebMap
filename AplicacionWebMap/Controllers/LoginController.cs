using AplicacionWebMap.Data;
using AplicacionWebMap.Models;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace AplicacionWebMap.Controllers
{
    public class LoginController : Controller
    {
        private readonly Conexion _conexion;

        public LoginController(Conexion conexion)
        {
            _conexion = conexion;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            Console.WriteLine(email+ "  h  "+ password);
            string query = "SELECT * FROM usuario WHERE correo = @email AND password = @password";

            // Ejecuta la consulta con parámetros
            DataTable data = _conexion.ExecuteQuery(query, new Dictionary<string, object>
             {
             { "@email", email },
              { "@password", password }
             });
            if (data.Rows.Count > 0)
            {
                Console.WriteLine(data.Rows[0].ToString());
                Usuario usuario = new Usuario()
                    {
                        Id = Convert.ToInt32(data.Rows[0]["Id"]),
                        Nombre = data.Rows[0]["nombre"].ToString(),
                        Telefono = Convert.ToInt64(data.Rows[0]["telefono"]),
                        Rol = Convert.ToInt16(data.Rows[0]["rol"]),
                        Correo = data.Rows[0]["correo"].ToString()
                };
                return RedirectToAction("Index", "Home");
            }
            return View();
        }
    }
}
