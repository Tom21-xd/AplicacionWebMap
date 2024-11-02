using Npgsql;
using System.Data;
using System.Reflection.Metadata;


namespace AplicacionWebMap.Data
{
    public class Conexion
    {
        private readonly string _connectionString;
        public Conexion(IConfiguration configuration)
        {
            // Lee la cadena de conexión desde appsettings.json
            _connectionString = configuration.GetConnectionString("PostgresConnection");
        }

        // Método para obtener la conexión
        public NpgsqlConnection GetConnection()
        {
            var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            return connection;
        }

        // Método para cerrar la conexión de forma segura
        public void CloseConnection(NpgsqlConnection connection)
        {
            if (connection != null && connection.State == ConnectionState.Open)
            {
                connection.Close();
            }
        }
        public DataTable ExecuteQuery(string query)
        {
            using (var connection = GetConnection())
            {
                using (var command = new NpgsqlCommand(query, connection))
                {
                    using (var adapter = new NpgsqlDataAdapter(command))
                    {
                        var dataTable = new DataTable();
                        adapter.Fill(dataTable);
                        CloseConnection(connection);
                        return dataTable;
                    }
                }
            }
        }

    }

}
