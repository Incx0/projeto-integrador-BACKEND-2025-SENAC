import dbMysql from "../database/dbMysql.js";
import crypto from "crypto";
import { compareSenha } from "../helpers/auth.helper.js";


// nn mexer
const connection = async () => dbMysql.connect();

export class AuthService {
  //metodo de login
  async login(usuarioOuEmail: string, senha: string) {
    let conn;
    try {
      conn = await connection();

      //executa um select para ver se existe o usuario ou email
      const [rows]: any = await conn.execute(
        `SELECT id, nome, usuario, email, senha, is_master_admin
        FROM users 
        WHERE usuario = ? OR email = ?`, 
        [usuarioOuEmail, usuarioOuEmail]
      );

      //valida se voltou um usuario ou email
      if (!rows || rows.length === 0) {
        return null;
      }

      //desconstroi o
      const user = rows[0];

      //valida se o hash da senha é similar
      const validarSenha = await compareSenha(senha, user.senha);
      if (!validarSenha) return null;

      //gera o token
      const token = crypto.randomBytes(32).toString("hex");

      //gera data e expiracao
      const now = new Date();
      const expiracao = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      //deleta o token antigo se existir
      await conn.execute(
        `DELETE FROM sessoes WHERE user_id = ?`,
        [user.id]
      );

      //insere o (novo)token
      await conn.execute(
        `INSERT INTO sessoes (user_id, token, expiracao) VALUES (?, ?, ?)`,
        [user.id, token, expiracao]
      );

      return {
        token,
        nome: user.nome,
        usuario: user.usuario,
        email: user.email,
        is_master_admin: user.is_master_admin
      };
    } catch (error) {
      console.error("Erro no login:", error);
      return { error: "Erro ao efetuar login", err: error };
    } finally {
      //libera a conexão
      conn?.release();
    }
  }


  //autoexplicativo
  async logout(token: string) {
    let conn;
    try {
      conn = await connection();
      await conn.execute(`DELETE FROM sessoes WHERE token = ?`, [token]);
      return true;
    } catch (error) {
      console.error("Erro no logout:", error);
      return { error: "Erro ao efetuar logout", err: error };
    } finally {
      //libera a conexão
      conn?.release();
    }
  }

  //metodo de valicao do token
  async validarToken(token: string) {
    let conn;
    try {
      conn = await connection();

      // valida se o token existe e se está expirado
      const [rows]: any = await conn.execute(
        `SELECT s.id, s.expiracao, u.id as user_id, u.nome, u.usuario, u.email
        FROM sessoes s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ? and expiracao > NOW()`,
        [token]
      );
      if (!rows || rows.length === 0) return null;

      //descontroi a sessao
      const sessao = rows[0];

      return {
        id: sessao.user_id,
        nome: sessao.nome,
        usuario: sessao.usuario,
        email: sessao.email,
        expiracao: sessao.expiracao
      };
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return { error: "Erro ao validar token", err: error };
    } finally {
      //libera a conexão
      conn?.release();
    }
  }
}
