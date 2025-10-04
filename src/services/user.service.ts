//importando dbMysql(basicamente o db);
import dbMysql from "../database/dbMysql.js";

import { ResultSetHeader } from "mysql2/promise";

import  send  from "./send-email.service.js"

import crypto, { randomBytes } from "crypto";

import { hashSenha } from "../helpers/auth.helper.js";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const userService = {
  getAllUsersService: async () => {
    let conn;
    try {
      conn = await connection();
      const [rows] = await conn.execute('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return { error: "Erro ao buscar usuários", err: error };
    } finally {
      conn?.release();
    }
  },


  getUserService: async (id: number | string) => {
    if (id == null) throw new Error("id inválido");

    let conn;
    try {
      const userId = Number(id);
      if (isNaN(userId)) throw new Error("id inválido");

      conn = await connection();
      const [rows]: any = await conn.execute(
        `SELECT * FROM users WHERE id = ?;`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return { error: "Erro ao buscar usuário", err: error };
    } finally {
      conn?.release();
    }
  },



  addUserService: async (user:any) => {
    let {email, usuario, senha, nome, nascimento, cpf} = user;
  
    if (!email || !usuario || !senha || !nome || !cpf || !nascimento) {
      return {error: 'Insira os dados corretamente'};
    }
  
    let conn;

    const senhaHash = await hashSenha(senha);
  
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
        [email, usuario, senhaHash, nome, nascimento, cpf]
      );
  
      return {message:'Usuario cadastrado com sucesso'};
  
    } catch(error) {
      console.error(error);
      return {error:'Erro ao cadastrar usuário', err: error};
  
    } finally {
      conn?.release();
    }
  },
  


  updateUserService: async (user:any)=> {
    let {id, usuario, email, senha, nome, nascimento}:any = user;

    
    let conn;
    
    try{
      conn = await connection()
      
      if(!id || id.length === 0) return {error:'não foi informado o usuário a ser alterado'};''

      if (email) {
        const updateEmail = await conn.execute(
          `UPDATE users SET email = ? WHERE id = ?`,
          [email, id]
        );
      }
      if (usuario) {
        const updateUser = await conn.execute(
          `UPDATE users SET usuario = ? WHERE id = ?`,
          [usuario, id]
        )
      }
      if (senha) {
        const updateSenha = await conn.execute(
          `UPDATE users SET senha = ? WHERE id = ?`,
          [senha, id]
        );
      }
      if (nome) {
        const updateNome = await conn.execute(
          `UPDATE users SET nome = ? WHERE id = ?`,
          [nome, id]
        );
      }
      if (nascimento) {
        const updateNascimento = await conn.execute(
          `UPDATE users SET nascimento = ? WHERE id = ?`,
          [nascimento, id]
        );
      }

      return {message:'Usuario atualizado com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao atualizar usuário', err};

    }finally{
      conn?.release();
    }
  },

  deleteUserService: async (id: any) => {
    let conn;
    try {
      conn = await connection();
      const [rows]: any = await conn.execute(
        `DELETE FROM users WHERE id = ?`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return { error: "Erro ao deletar usuário", err: error };
    } finally {
      conn?.release();
    }
  },


  recuperarSenhaService: async (email:any)=>{
    let conn;
    
    try{
      conn = await connection()
      
      if(!email || email.length === 0) return {error:'não foi informado o usuário a ser alterado'};

      const [rowsEmail]:any = await conn.execute(
        `SELECT id, nome FROM users WHERE email = ?`,
        [email]
      );

      let {id, nome} = rowsEmail[0];

      if (!rowsEmail || rowsEmail.length === 0) {
        return {message:'usuário não existe'};
      }

      const recupCode = crypto.randomBytes(4).toString("hex");

      console.log(recupCode);

      await conn.execute(
        `DELETE FROM codigos WHERE id = ?`,
        [id]
      );

      const now = new Date();
      const expiracao = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await conn.execute(
        `INSERT INTO \`codigos\` (user_id, codigo, tipo, expiracao) VALUES (?, ?)`,
        [id, recupCode, expiracao]
      );
  
      await send.sendRecupPasswordEmailService(email, nome, recupCode);

      return {message:'Email enviado'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao recuperar usuário', err};

    }finally{
      conn?.release();
    }
  },

  alterarSenhaService: async (user:any)=>{
    let {recupCode, senhaNova} = user;

    
    let conn;
    
    try{
      conn = await connection()
      
      const [rowsRecupCode]:any = await conn.execute(
        `SELECT user_id FROM codigos WHERE codigo = ? AND expiracao > NOW()`,
        [recupCode]
      );
      
      if (!rowsRecupCode || rowsRecupCode.length === 0) {
        return {error:'Código inválido'};
      }

      const id = rowsRecupCode[0].id;

      const updateSenha = await conn.execute(
        `UPDATE users SET senha = ? WHERE id = ?`,
        [senhaNova, id]
      );

      return {message:'Senha do usuário atualizada com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao atualizar usuário', err};

    }finally{
      conn?.release();
    }
  }
};

export default userService;