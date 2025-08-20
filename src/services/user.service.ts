//importando dbMysql(basicamente o db);
import dbMysql from "../database/dbMysql.js";

//nn apagar pelo amor de deus
const connection = async () => dbMysql.connect()

const userService = {
  getAllUsersService: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM users');
    return rows;
  },
  addUserService: async (user:any)=> {
    let {email,usuario,senha,nome,nascimento,cpf} = user;

    if (!email || !usuario || !senha || !nome || !cpf || !nascimento) {
      return {error: 'Insira os dados corretamente'};
    }

    let conn

    try{
      conn = await connection()

      const insert = await conn.execute(
        `INSERT INTO users (email,usuario,senha,nome,nascimento,cpf) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, usuario, senha, nome, nascimento, cpf]
      );

      return {message:'Usuario cadastrado com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao cadastrar usuário', err};

    }finally{
      if(conn){
        conn.end();
      }
    }
  }
};

export {connection};

export default userService;