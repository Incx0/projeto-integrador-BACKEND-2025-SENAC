import dbMysql from "../database/dbMysql.js";
import crypto from "crypto";

// mantém sua função de conexão
const connection = async () => dbMysql.connect();

export class AuthService {
  async login(usuarioOuEmail: string, senha: string) {
    const conn = await connection();

    const [rows]: any = await conn.execute(
      `SELECT id, nome, usuario, email
       FROM users 
       WHERE (usuario = ? OR email = ?) AND senha = ? `, 
      [usuarioOuEmail, usuarioOuEmail, senha]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");

    const now = new Date();
    const expiracao = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    await conn.execute(
      `INSERT INTO sessoes (user_id, token, expiracao) VALUES (?, ?, ?)`,
      [user.id, token, expiracao]
    );

    return {
      token,
      nome: user.nome,
      usuario: user.usuario,
      email: user.email
    };
  }

  async logout(token: string) {
    const conn = await connection();
    await conn.execute(`DELETE FROM sessoes WHERE token = ?`, [token]);
    return true;
  }

  async validarToken(token: string) {
    const conn = await connection();

    const [rows]: any = await conn.execute(
      `SELECT s.id, s.expiracao, u.id as user_id, u.nome, u.usuario, u.email
       FROM sessoes s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? and expiracao > NOW()`,
      [token]
    );

    if (!rows || rows.length === 0) return null;

    const sessao = rows[0];

    return {
      id: sessao.user_id,
      nome: sessao.nome,
      usuario: sessao.usuario,
      email: sessao.email,
      expiracao: sessao.expiracao
    };
  }
}
