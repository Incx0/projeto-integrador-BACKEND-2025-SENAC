import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "pi_2025",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10, // número máximo de conexões simultâneas
  queueLimit: 0
});

const dbMysql = {
  connect: async () => {
    try {
      const connection = await pool.getConnection();
      console.log("Query obtida da pool com sucesso");
      return connection;
    } catch (error) {
      console.error("Erro ao tentar dar Query na pool:", error);
      throw error;
    }
  }
};

export default dbMysql;
