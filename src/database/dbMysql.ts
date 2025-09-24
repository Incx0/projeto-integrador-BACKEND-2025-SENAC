//slk nn vou documentar essa coisa nn
import { Application } from "express";
import mysql2 from "mysql2/promise";

async function connectToDatabase() {
  const connection = await mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pi_2025'
  });
  return connection;
}

const dbMysql = {
  connect: async function() {
    try {
        const connection = await connectToDatabase();
        console.log("conexão com o bd concluída com êxito");
        return connection;
    } catch (error) {
        console.error("erro ao conectar com o bd:", error);
        throw error;
    }
    }
};
export default dbMysql;