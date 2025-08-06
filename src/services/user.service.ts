//import dbMysql from "../database/dbMysql";
import dbMysql from "../database/dbMysql";

const connection = async () => dbMysql.connect()

const userService = {
  getAllUsers: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM users');
    return rows;
  },
  getUser: async (paciente: any) => {
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
  }
};

export {connection};

export default userService;