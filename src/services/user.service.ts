//importando dbMysql(basicamente o db);
import dbMysql from "../database/dbMysql.js";

import { ResultSetHeader } from "mysql2/promise";

import  {sendRecupCodeEmail}  from "../helpers/pre-send-email.helper.js"

import crypto, { randomBytes } from "crypto";

import { hashSenha } from "../helpers/auth.helper.js";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const userService = {
  getAllUsersService: async () => {
    //declara conexão
    let conn;
    try {
      //chama conexão
      conn = await connection();
      const [rows] = await conn.execute('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return { error: "Erro ao buscar usuários", err: error };
    } finally {
      //libera a conexão
      conn?.release();
    }
  },


  getUserService: async (id: number | string) => {
    //verifica a existencia do id
    if (id == null) throw new Error("id inválido");
    
    //declara conexão
    let conn;
    try {
      //transforma o id em numero
      const userId = Number(id);
      //valida se o id é NaN
      if (isNaN(userId)) throw new Error("id inválido");

      //chama conexão
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
      //libera a conexão
      conn?.release();
    }
  },



  addUserService: async (user:any) => {
    //desconstroi o "body"
    let {email, usuario, senha, nome, nascimento, cpf} = user;

    //valida a existência dos campos necessários
    if (!email || !usuario || !senha || !nome || !cpf || !nascimento) {
      return {error: 'Insira os dados corretamente'};
    }

    //declara conexão
    let conn;

    const senhaHash = await hashSenha(senha);
  
    try {
      //chama conexão
      conn = await connection();

      //série de verificações de duplicidade
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

      //monta a message de erro conforme a necessidade
      if (hasUser || hasEmail || hasCPF) {
        let msg = 'Já existe um usuário com este';
        if (hasUser) msg += ' nome de usuário';
        if (hasEmail) msg += ' email';
        if (hasCPF) msg += ' CPF';
        return { error: msg.trim() };
      }

      //insere o novo usuário no bd
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO users (email, usuario, senha, nome, nascimento, cpf) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, usuario, senhaHash, nome, nascimento, cpf]
      );
  
      return {message:'Usuario cadastrado com sucesso'};
  
    } catch(error) {
      console.error(error);
      return {error:'Erro ao cadastrar usuário', err: error};
  
    } finally {
      //libera a conexão
      conn?.release();
    }
  },
  


  updateUserService: async (user:any)=> {
    //desconstroi o "body"
    let {id, usuario, email, nome, nascimento} = user;

    //declara conexão
    let conn;
    
    try{
      //chama conexão
      conn = await connection()
      id = Number(id)
      
      //validação do id
      if(!id || id.length === 0 || isNaN(id)) return {error:'não foi informado o usuário a ser alterado devidamente'};

      //serie de updates conforme a necessidade
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
      //libera a conexão
      conn?.release();
    }
  },

  deleteUserService: async (id: any) => {
    //declara conexão
    let conn;
    try {
      //chama conexão
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
      //libera a conexão
      conn?.release();
    }
  },


  recuperarSenhaService: async (email:string)=>{
    //declara conexão
    let conn;
    
    try{
      //chama conexão
      conn = await connection()
      
      //série de validações do email
      if(!email || email.length === 0) return {error:'não foi informado o usuário a ser alterado'};
      const [rowsEmail]:any = await conn.execute(
        `SELECT id, nome FROM users WHERE email = ?`,
        [email]
      );
      if (!rowsEmail || rowsEmail.length === 0) {
        return {message:'usuário não existe'};
      }

      //desconstroi a row
      let {id, nome} = rowsEmail[0];

      //gera o codigo de recuperação
      const recupCode = crypto.randomBytes(4).toString("hex");

      console.log(recupCode);

      //deleta o codigo antigo
      await conn.execute(
        `DELETE FROM codigos WHERE id = ?`,
        [id]
      );

      //gera a expiração do novo codigo
      const now = new Date();
      const expiracao = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      //insere o novo codigo no banco
      await conn.execute(
        `INSERT INTO \`codigos\` (user_id, codigo, tipo, expiracao) VALUES (?, ?)`,
        [id, recupCode, expiracao]
      );

      //envia o email de recuperação
      await sendRecupCodeEmail(email, nome, recupCode);

      return {message:'Email enviado'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao recuperar usuário', err};

    }finally{
      //libera a conexão
      conn?.release();
    }
  },

  alterarSenhaService: async (user:any)=>{
    //desconstroi o "body"
    let {recupCode, senhaNova} = user;

    //declara conexão
    let conn;
    
    try{
      //chama conexão
      conn = await connection()
      
      //valida o codigo de recuperação
      const [rowsRecupCode]:any = await conn.execute(
        `SELECT user_id FROM codigos WHERE codigo = ? AND expiracao > NOW()`,
        [recupCode]
      );
      if (!rowsRecupCode || rowsRecupCode.length === 0) {
        return {message:'Código inválido'};
      }

      //desconstroi a row
      const id = rowsRecupCode[0].id;

      //deleta o codigo para segurança
      await conn.execute(
        `DELETE FROM codigos WHERE id = ?`,
        [id]
      );

      //atualiza a senha do usuário
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
      //libera a conexão
      conn?.release();
    }
  }
};

export default userService;