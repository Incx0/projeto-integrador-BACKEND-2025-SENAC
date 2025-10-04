import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
  host: "yamabiko.proxy.rlwy.net",
  user: "root",
  password: "aveolXRubmwhyUXKbyaxYmazTGDkkiOb",
  database: "pi_2025",
  port: 54280,
  waitForConnections: true,
  connectionLimit: 10, // número máximo de conexões simultâneas
  queueLimit: 0
});

const dbMysql = {
  connect: async () => {
    try {
      const connection = await pool.getConnection();
      console.log("Conexão com o banco obtida do pool");
      return connection;
    } catch (error) {
      console.error("Erro ao conectar com o BD:", error);
      throw error;
    }
  }
};

export default dbMysql;
