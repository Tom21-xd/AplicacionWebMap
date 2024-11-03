using Npgsql;
using System.Data;
using System.Reflection.Metadata;


namespace AplicacionWebMap.Data
{
    public class Conexion
    {
        private readonly string _connectionString;
        private IConfiguration configuration;
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
        public DataTable ExecuteQuery(string query, Dictionary<string, object> parameters = null)
        {
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    Console.WriteLine($"Key: {param.Key}, Value: {param.Value}");
                }
            }
            using (var connection = GetConnection())
            {
                using (var command = new NpgsqlCommand(query, connection))
                {
                    if (connection.State == ConnectionState.Closed)
                    {
                        connection.Open();
                    }

                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                        }
                    }
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
