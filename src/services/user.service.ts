import dbMysql from "../database/dbMysql";
//import dbMysql from "../database/dbMysql";

const userService = {
  getAllUsers: async () => {
    const connection = await dbMysql.connect();
    const [rows] = await connection.execute('SELECT * FROM users');
    return rows;
  }
    // Outros métodos do serviço de usuário podem ser adicionados aqui
};
export default userService;