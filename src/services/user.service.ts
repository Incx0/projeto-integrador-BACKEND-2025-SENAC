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

      const [rowsUser]: any = await conn.execute(
        `SELECT email, usuario FROM users WHERE usuario = ?`,
        [usuario]
      );
      const [rowsEmail]: any = await conn.execute(
        `SELECT email, usuario FROM users WHERE email = ?`,
        [email]
      );
      const [rowsCPF]: any = await conn.execute(
        `SELECT email, usuario FROM users WHERE cpf = ?`,
        [cpf]
      );
      
      const hasUser = rowsUser.length > 0;
      const hasEmail = rowsEmail.length > 0;
      const hasCPF = rowsCPF.length > 0;

      if (hasUser || hasEmail || hasCPF) {
        let msg = 'Já existe um usuário com este';

        if (hasUser) msg += ' nome de usuário';
        if (hasEmail) msg += ' email';
        if (hasCPF) msg += ' CPF';

        return { error: msg.trim() };
      }

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