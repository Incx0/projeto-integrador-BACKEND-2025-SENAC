//importando dbMysql(basicamente o db);
import { log } from "console";
import dbMysql from "../database/dbMysql.js";

import { ResultSetHeader } from "mysql2/promise";

import  send  from "./send-email.service.js"

import crypto, { randomBytes } from "crypto";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const hospitalService = {
  getAllHospitaisService: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM hospitais');
    return rows;
  },
  getHospitalService: async (id: number | string) => {
    if (id == null) throw new Error("ID inválido");
  
    const hospitalId = Number(id);
    if (isNaN(hospitalId)) throw new Error("ID inválido");
  
    const conn = await connection();
    const [rows]: any = await conn.execute(
      `SELECT * FROM hospitais WHERE id = ?`,
      [hospitalId]
    );
    return rows;
  },
  addHospitalService: async (user:any) => {
    let {nome,lati,long,uf,cidade,logradouro, bairro} = user;
  
    if (!nome|| !lati || !long || !uf || !cidade || !logradouro || !bairro) {
      return {error: 'Insira os dados corretamente'};
    }
  
    let conn;
  
    try {
      conn = await connection();
  
      const [rowsLati]: any = await conn.execute(
        `SELECT lati FROM hospitais WHERE lati = ?`,
        [lati]
      );
      const [rowsLong]: any = await conn.execute(
        `SELECT longi FROM hospitais WHERE longi = ?`,
        [long]
      );
      const [rowsLogradouro]: any = await conn.execute(
        `SELECT logradouro FROM hospitais WHERE logradouro like ? AND cidade = ? AND bairro = ? AND uf = ?`,
        [logradouro, cidade, bairro, uf]
      );
      
  
      const hasLati = rowsLati.length > 0;
      const hasLong = rowsLong.length > 0;
      const hasLogradouro = rowsLogradouro.length > 0;
  
      if (hasLati || hasLong || hasLogradouro) {
        let msg = 'Já existe um hospital com este(a)';
        if (hasLati) msg += ' latitude';
        if (hasLong) msg += ' longitude';
        if (hasLogradouro) msg += ' logradouro';
        return { error: msg.trim() };
      }
  
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO hospitais (nome, lati, longi, uf, cidade, logradouro, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, lati, long, uf, cidade, logradouro, bairro]
      );
  
      return {message:'Hospital cadastrado com sucesso'};
  
    } catch(error) {
      console.error(error);
      return {error:'Erro ao cadastrar hospital', err: error};
  
    } finally {
      if(conn) conn.end();
    }
  },
  updateHospitalService: async (hospital:any)=> {
    let {id, nome, lati, long, uf, cidade, logradouro, bairro, qtd_paciente, tempo_espera}:any = hospital;

    
    let conn;
    
    try{
      conn = await connection()
      
      if(!id || id.length === 0) return {error:'não foi informado o hhospital a ser alterado'};''

      if (lati) {
        const updateLati = await conn.execute(
          `UPDATE hospitais SET lati = ? WHERE id = ?`,
          [lati, id]
        );
      }
      if (long) {
        const updateLong = await conn.execute(
          `UPDATE hospitais SET longi = ? WHERE id = ?`,
          [long, id]
        );
      }
      if (nome) {
        const updateNome = await conn.execute(
          `UPDATE hospitais SET nome = ? WHERE id = ?`,
          [nome, id]
        );
      }
      if (uf) {
        const updateUf = await conn.execute(
          `UPDATE hospitais SET uf = ? WHERE id = ?`,
          [uf, id]
        );
      }
      if (cidade) {
        const updateCidade = await conn.execute(
          `UPDATE hospitais SET cidade = ? WHERE id = ?`,
          [cidade, id]
        );
      }
      if (logradouro) {
        const updateLogradouro = await conn.execute(
          `UPDATE hospitais SET logradouro = ? WHERE id = ?`,
          [logradouro, id]
        );
      }
      if (bairro) {
        const updateBairro = await conn.execute(
          `UPDATE hospitais SET bairro = ? WHERE id = ?`,
          [bairro, id]
        );
      }
      if (qtd_paciente) {
        const updateQtdPaciente = await conn.execute(
          `UPDATE hospitais SET qtd_pacientes = ? WHERE id = ?`,
          [qtd_paciente, id]
        );
      }
      if (tempo_espera) {
        const updateFila_espera = await conn.execute(
          `UPDATE hospitais SET tempo_espera = ? WHERE id = ?`,
          [tempo_espera, id]
        );
      }

      return {message:'Hospital atualizado com sucesso'};

    }catch(error){
      const err = error;
      console.error(error);

      return {error:'Erro ao atualizar hospital', err};

    }finally{
      if(conn){
        conn.end();
      }
    }
  },
  deleteHospitalService: async (id:any) => {
    const conn = await connection();
    const [rows]: any = await conn.execute(
        `DELETE FROM hospitais WHERE id = ?`,
        [id]
    );
    return rows;
  },
};

export {connection};

export default hospitalService;