//importando dbMysql(basicamente o db);
import { log } from "console";
import dbMysql from "../database/dbMysql.js";

import { ResultSetHeader } from "mysql2/promise";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const hospitalService = {
  getAllHospitaisService: async () => {
    const conn = await connection();
    const [rows] = await conn.execute('SELECT * FROM hospitais');
    return rows;
  },
  getHospitalService: async (id: number | string) => {
    if (id == null) throw new Error("id inválido");
  
    const hospitalId = Number(id);
    if (isNaN(hospitalId)) throw new Error("id inválido");
  
    const conn = await connection();
    const [rows]: any = await conn.execute(
      `SELECT * FROM hospitais WHERE id = ?`,
      [hospitalId]
    );
    return rows;
  },
  addHospitalService: async (hospital: any) => {
    let { nome, lati, long, uf, cidade, logradouro, bairro, foto } = hospital;
  
    if (!nome || !lati || !long || !uf || !cidade || !logradouro || !bairro || !foto) {
      return { error: "Insira os dados corretamente" };
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
        let msg = "Já existe um hospital com este(a)";
        if (hasLati) msg += " latitude";
        if (hasLong) msg += " longitude";
        if (hasLogradouro) msg += " logradouro";
        return { error: msg.trim() };
      }
  
      await conn.execute<ResultSetHeader>(
        `INSERT INTO hospitais (nome, lati, longi, uf, cidade, logradouro, bairro, foto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, lati, long, uf, cidade, logradouro, bairro, foto]
      );
  
      return { message: "Hospital cadastrado com sucesso" };
    } catch (error) {
      console.error(error);
      return { error: "Erro ao cadastrar hospital", err: error };
    } finally {
      if (conn) conn.end();
    }
  },
  updateHospitalService: async (hospital: any) => {
    let {
      id,
      nome,
      lati,
      long,
      uf,
      cidade,
      logradouro,
      bairro,
      qtd_laranja,
      qtd_amarelo,
      qtd_verde,
      qtd_azul,
      tempo_espera,
      foto,
    } = hospital;
  
    if (!id) return { error: "ID do hospital é obrigatório" };

    let conn:any;

    try {
      conn = await connection();

      const calcularTempoFilaEspera = async (id: number) => {
        try{
          const [rowsId] = await conn.execute(
            `SELECT qtd_pacientes_id, qtd_medicos_id FROM hospitais WHERE id = ?`,
            [id]
          );
          
          if (!rowsId || rowsId.length === 0) {
            throw new Error("Hospital não encontrado");
          }

          const { qtd_pacientes_id, qtd_medicos_id} = rowsId[0]

          const [rowsPulseiras] = await conn.execute(
            `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE id = ?`,
            [qtd_pacientes_id]
          );

          if (!rowsPulseiras || rowsPulseiras.length === 0) {
            throw new Error("não há nenhum registro de paciente encontrado");
          }

          const {
            qtd_laranja: laranjas,
            qtd_amarelo: amarelos,
            qtd_verde: verdes,
            qtd_azul: azuis,
          } = rowsPulseiras[0];
        
          const [rowsMedicos] = await conn.execute(
            `SELECT qtd, qtd_livre FROM fila_espera WHERE id = ?`,
            [qtd_medicos_id]
          );

          if (!rowsMedicos || rowsMedicos.length === 0) {
            throw new Error("não há nenhum registro de medico");
          }

          let { qtd: qtdMedicos, qtd_livre: qtdMedicosLivre} = rowsMedicos[0]
            
          const divisor = qtdMedicosLivre > 0 ? qtdMedicosLivre : qtdMedicos;
  
          const media_atendimento_laranja = 10;
          const media_atendimento_amarelo = 60;
          const media_atendimento_verde = 120;
          const media_atendimento_azul = 240;
        
          const peso = {
            laranja: media_atendimento_laranja,
            amarelo: media_atendimento_amarelo,
            verde: media_atendimento_verde,
            azul: media_atendimento_azul,
          };
        
          const cargaTotal =
          (laranjas * peso.laranja) + (amarelos * peso.amarelo) + (verdes * peso.verde) + (azuis * peso.azul);
        
          if(peso.laranja === 0) cargaTotal*0.5;
          if(peso.laranja === 0 && peso.amarelo === 0) cargaTotal*0.25;
  
          const totalTempoEstimado = cargaTotal / divisor;
  
          await conn.execute(`UPDATE hospitais SET tempo_espera = ? WHERE id = ?`, [totalTempoEstimado, id]);
          console.log(totalTempoEstimado)

        }catch(error){
          return {error:`Erro ao estimar o tempo de fila`}
        }
      };

      if (lati !== undefined && lati !== null) {
        await conn.execute(`UPDATE hospitais SET lati = ? WHERE id = ?`,
        [lati, id]);
      }
  
      if (long !== undefined && long !== null) {
        await conn.execute(`UPDATE hospitais SET longi = ? WHERE id = ?`,
        [long, id]);
      }
  
      if (nome !== undefined && nome !== null) {
        await conn.execute(`UPDATE hospitais SET nome = ? WHERE id = ?`,
        [nome, id]);
      }
  
      if (uf !== undefined && uf !== null) {
        await conn.execute(`UPDATE hospitais SET uf = ? WHERE id = ?`,
        [uf, id]);
      }
  
      if (cidade !== undefined && cidade !== null) {
        await conn.execute(`UPDATE hospitais SET cidade = ? WHERE id = ?`,
        [cidade, id]);
      }
  
      if (logradouro !== undefined && logradouro !== null) {
        await conn.execute(`UPDATE hospitais SET logradouro = ? WHERE id = ?`,
        [logradouro, id]);
      }
  
      if (bairro !== undefined && bairro !== null) {
        await conn.execute(`UPDATE hospitais SET bairro = ? WHERE id = ?`,
        [bairro, id]);
      }

      if (qtd_laranja !== undefined && qtd_laranja !== null) {
        await conn.execute(`UPDATE hospitais SET qtd_laranja = ? WHERE id = ?`,
        [qtd_laranja, id]);
      }

      if (qtd_amarelo !== undefined && qtd_amarelo !== null) {
        await conn.execute(`UPDATE hospitais SET qtd_amarelo = ? WHERE id = ?`,
        [qtd_amarelo, id]);
      }

      if (qtd_verde !== undefined && qtd_verde !== null) {
        await conn.execute(`UPDATE hospitais SET qtd_verde = ? WHERE id = ?`,
        [qtd_verde, id]);
      }

      if (qtd_azul !== undefined && qtd_azul !== null) {
        await conn.execute(`UPDATE hospitais SET qtd_azul = ? WHERE id = ?`,
        [qtd_azul, id]);
      }
  
      if (tempo_espera !== undefined && tempo_espera !== null) {
        await conn.execute(`UPDATE hospitais SET tempo_espera = ? WHERE id = ?`,
        [tempo_espera, id]);
      }
  
      if (foto !== undefined && foto !== null) {
        await conn.execute(`UPDATE hospitais SET foto = ? WHERE id = ?`,
        [foto, id]);
      }

      if(
      (qtd_azul !== undefined && qtd_azul !== null)||
      (qtd_verde !== undefined && qtd_verde !== null)||
      (qtd_amarelo !== undefined && qtd_amarelo !== null)||
      (qtd_laranja !== undefined && qtd_laranja !== null)){
        calcularTempoFilaEspera(id);
      }
  
      return { message: "Hospital atualizado com sucesso" };
    } catch (err) {
      console.error(err);
      return { error: "Erro ao atualizar hospital", err };
    } finally {
      if (conn) conn.end();
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