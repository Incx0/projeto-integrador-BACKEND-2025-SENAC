import mysql2 from "mysql2/promise";
async function connectToDatabase() {
    const connection = await mysql2.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'teste_projeto_integrador2025'
    });
    return connection;
}
const dbMysql = {
    connect: async function () {
        try {
            const connection = await connectToDatabase();
            console.log("Conectado ao banco :) ebaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            return connection;
        }
        catch (error) {
            console.error("Erro ao conectar ao banco de dados MySQL:", error);
            throw error;
        }
    }
};
export default dbMysql;
