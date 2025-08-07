//import dbMysql from "../database/dbMysql";
import dbMysql from "../database/dbMysql";

const connection = async () => dbMysql.connect()

const userService = {
  getAllUsersService: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM users');
    return rows;
  },
  getUserService: async (paciente: any) => {
    let {usuario, email, senha} = paciente;
    if(
      ((email == undefined || email == "") && (usuario == undefined || usuario == "")) || 
      ((email == undefined || email == "") && (senha == undefined || senha == "")) ||
      ((usuario == undefined || usuario == "") && (senha == undefined || senha == "")) ||
      ((usuario == undefined || usuario == "") && (senha == undefined || senha == "") && (email == undefined || email == ""))
    ){  
      return{
        status: 400,
        body: { message: "Credenciais insuficientes: informe usuário/email e senha"}
      }
    }else if(email == undefined || email == ""){
      email = ""
    }else if(usuario == undefined || usuario == ""){
      usuario = ""
    }

    const conn = await connection();
    const row = await conn.execute(
      `SELECT usuario,email,senha,cpf,nascimento,nome FROM users where (usuario = ? OR email= ?) AND senha= ?`, 
      [usuario,email,senha]
    );
    console.log(row);
    return row;
  },
  addUserService: async (user:any, callback:any)=> {
    let {email,usuario,senha,nome,nascimento,cpf} = user;
    if (!email || !usuario || !senha || !nome || ! cpf) {
    return callback({ error: 'Insira os dados corretamente' });
    }else if(!nascimento){
      nascimento = "";
    }
    let conn
    try{
      conn = await connection()
      const insert = await conn.execute(
        `INSERT INTO users (email,usuario,senha,nome,nascimento,cpf) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, usuario, senha, nome, nascimento, cpf]
      );
      callback({message:'Usuario cadastrado com sucesso'});
    }catch(error){
      console.error(error);
      callback({message:'Erro ao cadastrar usuário'});
    }finally{
      if(conn){
        conn.end();
      }
    }
  }
};

export {connection};

export default userService;