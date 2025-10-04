//importando dbMysql(basicamente o db);
import dbMysql from "../database/dbMysql.js";



import { ResultSetHeader } from "mysql2/promise";

//faz a conexão com o banco de dados
const connection = async () => dbMysql.connect()

const hospitalService = {

  //traz todos os hospitais
  getAllHospitaisService: async () => {
    let conn;
    try {
      conn = await connection();
      const [rows] = await conn.execute(
        'SELECT a.id, a.nome, a.lati, a.longi, a.uf, a.cidade, a.foto, b.tempo_espera FROM hospitais AS a JOIN fila_espera AS b WHERE a.id = b.hospitais_id;'
      );
      return rows;
    } catch (error) {
      console.error("Erro ao buscar hospitais:", error);
      return { error: "Erro ao buscar hospitais", err: error };
    } finally {
      conn?.release();
    }
  },

  //traz um hospital em especifico por id
  getHospitalService: async (id: number | string) => {
    if (id == null) throw new Error("id inválido");

    const hospitalId = Number(id);
    if (isNaN(hospitalId)) throw new Error("id inválido");

    let conn;
    try {
      conn = await connection();
      const [rows]: any = await conn.execute(
        `SELECT a.nome, a.lati, a.longi, a.foto, b.tempo_espera
        FROM hospitais AS a
        JOIN fila_espera AS b
        WHERE a.id = ? AND b.hospitais_id = ?;`,
        [hospitalId, hospitalId]
      );
      return rows;
    } catch (error) {
      console.error("Erro ao buscar hospital:", error);
      return { error: "Erro ao buscar hospital", err: error };
    } finally {
      conn?.release();
    }
  },


  //adiciona um hospital
  addHospitalService: async (hospital: any) => {
    //descontroi o "body"
    let { nome, lati, longi, uf, cidade, logradouro, bairro, foto } = hospital;

    //valida se os "campos" existem
    if (!nome || !lati || !longi || !uf || !cidade || !logradouro || !bairro || !foto) {
      return { error: "Insira os dados corretamente" };
    }

    //declara conexão com bd
    let conn;
  
    try {
      //executa a conexão com o bd
      conn = await connection();

      //verifica se já
      const [rowsLati]: any = await conn.execute(
        `SELECT lati FROM hospitais WHERE lati = ?`,
        [lati]
      );
      const [rowsLongi]: any = await conn.execute(
        `SELECT longi FROM hospitais WHERE longi = ?`,
        [longi]
      );
      const [rowsLogradouro]: any = await conn.execute(
        `SELECT logradouro FROM hospitais WHERE logradouro like ? AND cidade = ? AND bairro = ? AND uf = ?`,
        [logradouro, cidade, bairro, uf]
      );
  
      const hasLati = rowsLati.length > 0;
      const hasLongi = rowsLongi.length > 0;
      const hasLogradouro = rowsLogradouro.length > 0;
  
      if (hasLati || hasLongi || hasLogradouro) {
        let msg = "Já existe um hospital com este(es/a/as)";
        if (hasLati && hasLongi) msg += " cordenadas";
        if (hasLogradouro) msg += " logradouro";
        return { error: msg.trim() };
      }
  
      const [insertHospital] = await conn.execute<ResultSetHeader>(
        `INSERT INTO hospitais (nome, lati, longi, uf, cidade, logradouro, bairro, foto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, lati, longi, uf, cidade, logradouro, bairro, foto]
      );

      const hospitalId = insertHospital.insertId;

      await conn.execute<ResultSetHeader>(
        `INSERT INTO qtd_medicos (qtd, qtd_livres, hospitais_id) 
         VALUES (?, ?, ?)`,
        [2, 1.0, hospitalId]
      );

      await conn.execute<ResultSetHeader>(
        `INSERT INTO fila_espera (qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul, tempo_espera, hospitais_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [0, 0, 0, 0, 0, hospitalId]
      );
  
      return { message: "Hospital cadastrado com sucesso" };
    } catch (error) {
      console.error(error);
      return { error: "Erro ao cadastrar hospital", err: error };
    } finally {
      conn?.release();
    }
  },
  updateHospitalService: async (hospital: any) => {
    let {
      id,
      nome,
      lati,
      longi,
      uf,
      cidade,
      logradouro,
      bairro,
      qtdd_laranja,
      qtdd_amarelo,
      qtdd_verde,
      qtdd_azul,
      qtdd_medico,
      perc_medico_livre,
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
            `SELECT qtd, qtd_livre FROM qtd_medicos WHERE id = ?`,
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
  
          await conn.execute(`UPDATE fila_espera SET tempo_espera = ? WHERE hospitais_id = ?`, [totalTempoEstimado, id]);
          console.log(totalTempoEstimado)

        }catch(error){
          return {error:`Erro ao estimar o tempo de fila`}
        }
      };

      if (lati !== undefined && lati !== null) {
        await conn.execute(`UPDATE hospitais SET lati = ? WHERE id = ?`,
        [lati, id]);
      }
  
      if (longi !== undefined && longi !== null) {
        await conn.execute(`UPDATE hospitais SET longi = ? WHERE id = ?`,
        [longi, id]);
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

      if (qtdd_laranja !== undefined && qtdd_laranja !== null) {
        await conn.execute(`UPDATE fila_espera SET qtd_laranja = ? WHERE hospitais_id = ?`,
        [qtdd_laranja, id]);
      }

      if (qtdd_amarelo !== undefined && qtdd_amarelo !== null) {
        await conn.execute(`UPDATE fila_espera SET qtd_amarelo = ? WHERE hospitais_id = ?`,
        [qtdd_amarelo, id]);
      }

      if (qtdd_verde !== undefined && qtdd_verde !== null) {
        await conn.execute(`UPDATE fila_espera SET qtd_verde = ? WHERE hospitais_id = ?`,
        [qtdd_verde, id]);
      }

      if (qtdd_azul !== undefined && qtdd_azul !== null) {
        await conn.execute(`UPDATE fila_espera SET qtd_azul = ? WHERE hospitais_id = ?`,
        [qtdd_azul, id]);
      }
  
      if (tempo_espera !== undefined && tempo_espera !== null) {
        await conn.execute(`UPDATE fila_espera SET tempo_espera = ? WHERE hospitais_id = ?`,
        [tempo_espera, id]);
      }
  
      if (foto !== undefined && foto !== null) {
        await conn.execute(`UPDATE hospitais SET foto = ? WHERE id = ?`,
        [foto, id]);
      }

      if (qtdd_medico !== undefined && qtdd_medico !== null) {
        await conn.execute(`UPDATE qtd_medicos SET qtd = ? WHERE hospitais_id = ?`,
        [qtdd_medico, id]);
      }

      if (perc_medico_livre !== undefined && perc_medico_livre !== null) {
        await conn.execute(`UPDATE qtd_medicos SET qtd_livre = ? WHERE hospitais_id = ?`,
        [perc_medico_livre, id]);
      }

      if(
      (qtdd_azul !== undefined && qtdd_azul !== null)||
      (qtdd_verde !== undefined && qtdd_verde !== null)||
      (qtdd_amarelo !== undefined && qtdd_amarelo !== null)||
      (qtdd_laranja !== undefined && qtdd_laranja !== null)){
        calcularTempoFilaEspera(id);
      }
  
      return { message: "Hospital atualizado com sucesso" };
    } catch (err) {
      console.error(err);
      return { error: "Erro ao atualizar hospital", err };
    } finally {
      conn?.release();
    }
  },
  deleteHospitalService: async (id: any) => {
    let conn;
    try {
      conn = await connection();
      const [rows]: any = await conn.execute(
        `DELETE FROM hospitais WHERE id = ?`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error("Erro ao deletar hospital:", error);
      return { error: "Erro ao deletar hospital", err: error };
    } finally {
      conn?.release();
    }
  },

};

export {connection};

export default hospitalService;