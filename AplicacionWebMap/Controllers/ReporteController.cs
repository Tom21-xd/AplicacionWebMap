using AplicacionWebMap.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace AplicacionWebMap.Controllers
{
    public class ReporteController : Controller
    {
        public IActionResult Reportes()
        {
            return View();
        }
    }
}
