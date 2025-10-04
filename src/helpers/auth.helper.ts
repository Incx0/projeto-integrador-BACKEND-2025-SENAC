import bcrypt from "bcrypt";

//rodadas de hashes
const SALT_ROUNDS = 12;

//funcao para hashear a senha
export async function hashSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

//funcao para comparar a senha
export async function compareSenha(senhaDigitada: string, senhaHash: string): Promise<boolean> {
  return await bcrypt.compare(senhaDigitada, senhaHash);
}