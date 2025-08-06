import { Application } from "express";
import mysql2 from "mysql2/promise";

async function connectToDatabase() {
  const connection = await mysql2.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
  });
  return connection;
}

const dbMysql = {
  connect: async function() {
    try {
        const connection = await connectToDatabase();
        console.log("Conectado ao banco de dados MySQL");
        return connection;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados MySQL:", error);
        throw error;
    }
    }
};
export default dbMysql;