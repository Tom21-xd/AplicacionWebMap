using AplicacionWebMap.Data;
using AplicacionWebMap.Models;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace AplicacionWebMap.Controllers
{
    public class UsuarioController : Controller
    {
        private readonly Conexion _conexion;

        public UsuarioController(Conexion conexion)
        {
            _conexion = conexion;
        }
        public IActionResult Usuarios()
        {
            string query = "SELECT * FROM usuario";

            DataTable usuariosDataTable = _conexion.ExecuteQuery(query);

            var usuariosList = new List<Usuario>();
            foreach (DataRow row in usuariosDataTable.Rows)
            {
                usuariosList.Add(new Usuario
                {
                    Id = Convert.ToInt32(row["Id"]),
                    Nombre = row["nombre"].ToString(),
                    Telefono = Convert.ToInt64(row["telefono"]),
                    Rol = Convert.ToInt16(row["rol"]),
                    Correo = row["correo"].ToString(),

                });
            }

            return View(usuariosList);
        }

        public IActionResult Registro()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Registro(Usuario usuario)
        {

            string query = "INSERT INTO usuario (id, nombre, telefono, rol, correo, password) VALUES (@id, @nombre, @telefono, @rol, @correo, @password)";
            var parameters = new Dictionary<string, object>
    {
        { "@id", usuario.Id },
        { "@nombre", usuario.Nombre },
        { "@telefono", usuario.Telefono },
        { "@rol", 1 },
        { "@correo", usuario.Correo },
        { "@password", usuario.Password }
    };

            // Ejecutar el query para insertar los datos
            _conexion.ExecuteQuery(query, parameters);

            // Redirigir a la lista de usuarios o a otra vista después de registrar
            return RedirectToAction("Login", "Login");
        }
    }
}
