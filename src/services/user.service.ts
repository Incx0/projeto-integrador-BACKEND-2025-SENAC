//importando dbMysql(basicamente o db);
import { log } from "console";
import dbMysql from "../database/dbMysql.js";

import { ResultSetHeader } from "mysql2/promise";

import  send  from "./send-email.service.js"

import crypto, { randomBytes } from "crypto";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const userService = {
  getAllUsersService: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM users');
    return rows;
  },


  addUserService: async (user:any) => {
    let {email, usuario, senha, nome, nascimento, cpf} = user;
  
    if (!email || !usuario || !senha || !nome || !cpf || !nascimento) {
      return {error: 'Insira os dados corretamente'};
    }
  
    let conn;
  
    try {
      conn = await connection();
  
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
  
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO users (email, usuario, senha, nome, nascimento, cpf) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, usuario, senha, nome, nascimento, cpf]
      );
      
      const userId = result.insertId;
  
      const verifyCode = crypto.randomBytes(4).toString("hex");
  
      await conn.execute(
        `INSERT INTO \`verify_codes\` (user_id, codigo) VALUES (?, ?)`,
        [userId, verifyCode]
      );
  
      console.log(verifyCode);
  
      await send.sendEmailVerifyAccountService(email, nome, verifyCode);
  
      return {message:'Usuario cadastrado com sucesso'};
  
    } catch(error) {
      console.error(error);
      return {error:'Erro ao cadastrar usuário', err: error};
  
    } finally {
      if(conn) conn.end();
    }
  },
  


  updateUserService: async (user:any)=> {
    let {cpf, email, senha, nome, nascimento}:any = user;

    
    let conn;
    
    try{
      conn = await connection()
      
      if(!cpf || cpf.length === 0) return {error:'não foi informado o usuário a ser alterado'};''

      if (email) {
        const updateEmail = await conn.execute(
          `UPDATE users SET email = ? WHERE cpf = ?`,
          [email, cpf]
        );
      }
      if (senha) {
        const updateSenha = await conn.execute(
          `UPDATE users SET senha = ? WHERE cpf = ?`,
          [senha, cpf]
        );
      }
      if (nome) {
        const updateNome = await conn.execute(
          `UPDATE users SET nome = ? WHERE cpf = ?`,
          [nome, cpf]
        );
      }
      if (nascimento) {
        const updateNascimento = await conn.execute(
          `UPDATE users SET nascimento = ? WHERE cpf = ?`,
          [nascimento, cpf]
        );
      }

      return {message:'Usuario atualizado com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao atualizar usuário', err};

    }finally{
      if(conn){
        conn.end();
      }
    }
  },

  recuperarSenhaService: async (user:any)=>{
    let {email, senhaNova} = user;

    
    let conn;
    
    try{
      conn = await connection()
      
      if(!email || email.length === 0) return {error:'não foi informado o usuário a ser alterado'};

      const [rowsEmail]:any = await conn.execute(
        `SELECT cpf FROM users WHERE email = ?`,
        [email]
      );

      let {cpf} = rowsEmail[0];

      if (!rowsEmail || rowsEmail.length === 0) {
        return {error:'não há usuário com este email'};
      }

      const updateEmail = await conn.execute(
        `UPDATE users SET senha = ? WHERE cpf = ?`,
        [senhaNova, cpf]
      );

      return {message:'senha do usuario atualizada com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao atualizar usuário', err};

    }finally{
      if(conn){
        conn.end();
      }
    }
  }
};

export {connection};

export default userService;