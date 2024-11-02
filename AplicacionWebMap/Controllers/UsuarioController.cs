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
                });
            }

            return View(usuariosList);
        }
    }
}
