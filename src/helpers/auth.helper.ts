import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

export async function compareSenha(senhaDigitada: string, senhaHash: string): Promise<boolean> {
  return await bcrypt.compare(senhaDigitada, senhaHash);
}