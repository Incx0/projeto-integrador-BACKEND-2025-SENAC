//importando dbMysql(basicamente o db);
import dbMysql from "../database/dbMysql.js";

import { formulaCalcularPulseira } from "../helpers/calc-pulseira.helper.js"

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
      //libera a conexão
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
      //libera a conexão
      conn?.release();
    }
  },


  //adiciona um hospital
  addHospitalService: async (hospital: any) => {
    //desconstroi o "body"
    let { 
      nome, 
      lati, 
      longi, 
      uf, 
      cidade, 
      logradouro, 
      bairro, 
      foto 
    } = hospital;

    //valida se os "campos" existem
    if (!nome || !lati || !longi || !uf || !cidade || !logradouro || !bairro) {
      return { error: "Insira os dados corretamente" };
    }

    //declara conexão com bd
    let conn;
  
    try {
      //executa a conexão com o bd
      conn = await connection();

      //verifica se já existe algo nessa latitude e longitude
      const [rowsLatiLongi]: any = await conn.execute(
        `SELECT lati, longi FROM hospitais WHERE lati = ? AND longi = ?`,
        [lati, longi]
      );
      //verifica se já existe algo nesse logradouro
      const [rowsLogradouro]: any = await conn.execute(
        `SELECT logradouro FROM hospitais WHERE logradouro like ? AND cidade = ? AND bairro = ? AND uf = ?`,
        [logradouro, cidade, bairro, uf]
      );

      //configura a mensagem de duplicidade conforme o necessário
      const hasLatiLongi = rowsLatiLongi.length > 0;
      const hasLogradouro = rowsLogradouro.length > 0;
      if (hasLatiLongi || hasLogradouro) {
        let msg = "Já existe um hospital com este(es/a/as)";
        if (hasLatiLongi) msg += " cordenadas";
        if (hasLogradouro) msg += " logradouro";
        return { error: msg.trim() };
      }

      //insert do hospital
      const [insertHospital] = await conn.execute<ResultSetHeader>(
        `INSERT INTO hospitais (nome, lati, longi, uf, cidade, logradouro, bairro, foto) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, lati, longi, uf, cidade, logradouro, bairro, foto]
      );

      //desconstroi a row para pegar o id
      const hospitalId = insertHospital.insertId;

      //insere os medicos base
      await conn.execute<ResultSetHeader>(
        `INSERT INTO qtd_medicos (qtd, qtd_livres, hospitais_id) 
         VALUES (?, ?, ?)`,
        [2, 1.0, hospitalId]
      );

      //insere a fila base
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
      //libera a conexão
      conn?.release();
    }
  },

  updateRemoveFromFilaHospitalService: async (hospital: any) => {
    //desconstroi o "body"
    let {
      id
    } = hospital;

    //valida se o id veio
    if (!id) return { error: "ID do hospital é obrigatório" };

    console.log("id"+ id)

    id = Number(id);

    //declara conexão
    let conn:any;

    try {
      //chama a conexão
      conn = await connection();
      
      const [rowsPulseiras] = await conn.execute(
        `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE hospitais_id = ?`,
        [id]
      );
      
      //valida se trouxe as qtd de pulseira
      if (!rowsPulseiras || rowsPulseiras.length === 0) {
        throw new Error("não há nenhum registro de paciente encontrado");
      }

      //descontroi a row para obter as qtd de pulseiras
      const {
        qtd_laranja: laranjas,
        qtd_amarelo: amarelos,
        qtd_verde: verdes,
        qtd_azul: azuis,
      } = rowsPulseiras[0];

      console.log(`bfr: lrj: ${laranjas} amr: ${amarelos} vrd: ${verdes} azs: ${azuis}`);

      if(laranjas == 0 && amarelos == 0 && verdes == 0 && azuis == 0){
        return { message: "Não há pacientes" };
      }

      //sequencia de verificação e inserts dos campos enviados no body      
      if (laranjas !== undefined && laranjas !== null && laranjas > 0) {
        let qtd = Number(laranjas) - 1;
        await conn.execute(`UPDATE fila_espera SET qtd_laranja = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (amarelos !== undefined && amarelos !== null && laranjas == 0 && amarelos > 0) {
        let qtd = Number(amarelos) - 1;
        await conn.execute(`UPDATE fila_espera SET qtd_amarelo = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (verdes !== undefined && verdes !== null && amarelos == 0 && laranjas == 0 && verdes > 0) {
        let qtd = Number(verdes) - 1;
        await conn.execute(`UPDATE fila_espera SET qtd_verde = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (azuis !== undefined && azuis !== null && amarelos == 0 && laranjas == 0 && verdes == 0 && azuis > 0) {
        let qtd = Number(azuis) - 1;
        await conn.execute(`UPDATE fila_espera SET qtd_azul = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      //começa a fazer as coisas para atualzar o tempo de fila
      try{
        //da um select da qtd pacientes na fila de espera
        const [rowsPulseiras] = await conn.execute(
          `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE hospitais_id = ?`,
          [id]
        );

        await conn.execute(`UPDATE fila_espera SET tempo_espera = 0 WHERE hospitais_id = ?`, [id]);
      
        //valida se trouxe as qtd de pulseira
        if (!rowsPulseiras || rowsPulseiras.length === 0) {
          throw new Error("não há nenhum registro de paciente encontrado");
        }

        //descontroi a row para obter as qtd de pulseiras
        const {
          qtd_laranja: laranjas,
          qtd_amarelo: amarelos,
          qtd_verde: verdes,
          qtd_azul: azuis,
        } = rowsPulseiras[0];

        console.log(`afr: lrj: ${laranjas} amr: ${amarelos} vrd: ${verdes} azs: ${azuis}`);

        //obtem a qtd de médico(qtd) e porcentagem de médicos livres(qtd_livre)
        const [rowsMedicos] = await conn.execute(
          `SELECT qtd, qtd_livres FROM qtd_medicos WHERE hospitais_id = ?`,
          [id]
        );
    
        //valida se retornou
        if (!rowsMedicos || rowsMedicos.length === 0) {
          throw new Error("não há nenhum registro de medico");
        }
    
        //desconstroi a row
        let { qtd: qtdMedicos, qtd_livres: qtdMedicosLivre} = rowsMedicos[0]
    
        //chama e envia os parametros para o helper que calcula o tempo estimado de espera
        const tempoEstimado = await formulaCalcularPulseira(qtdMedicos, qtdMedicosLivre, laranjas, amarelos, verdes, azuis);

        //valida se o tempo estimado foi executado com sucesso
        if (!tempoEstimado && tempoEstimado !== 0) throw new Error('Erro ao calcular tempo estimado');

        //atualiza a estimativa de espera na fila
        await conn.execute(`UPDATE fila_espera SET tempo_espera = ? WHERE hospitais_id = ?`, [tempoEstimado, id]);
        console.log(tempoEstimado);

      }catch(error){
        return {error:`Erro ao estimar o tempo de fila`}
      }
  
      return { message: "Fila atualizado com sucesso" };
    } catch (err) {
      console.error(err);
      return { error: "Erro ao atualizar Fila", err };
    } finally {
      //libera a conexão
      conn?.release();
    }
  },

  updateFilaHospitalService: async (hospital: any) => {
    //desconstroi o "body"
    let {
      id,
      cor
    } = hospital;

    //valida se o id veio
    if (!id) return { error: "ID do hospital é obrigatório" };

    //declara conexão
    let conn:any;

    try {
      //chama a conexão
      conn = await connection();
      
      const [rowsPulseiras] = await conn.execute(
        `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE hospitais_id = ?`,
        [id]
      );
      
      //valida se trouxe as qtd de pulseira
      if (!rowsPulseiras || rowsPulseiras.length === 0) {
        throw new Error("não há nenhum registro de paciente encontrado");
      }

      //descontroi a row para obter as qtd de pulseiras
      const {
        qtd_laranja: laranjas,
        qtd_amarelo: amarelos,
        qtd_verde: verdes,
        qtd_azul: azuis,
      } = rowsPulseiras[0];

      console.log(`bfr: lrj: ${laranjas} amr: ${amarelos} vrd: ${verdes} azs: ${azuis}`);

      //sequencia de verificação e inserts dos campos enviados no body      
      if (cor=="laranja") {
        let qtd = laranjas + 1;
        await conn.execute(`UPDATE fila_espera SET qtd_laranja = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (cor=="amarelo") {
        let qtd = amarelos + 1;
        await conn.execute(`UPDATE fila_espera SET qtd_amarelo = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (cor=="verde") {
        let qtd = verdes + 1;
        await conn.execute(`UPDATE fila_espera SET qtd_verde = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      if (cor=="azul") {
        let qtd = azuis + 1;
        await conn.execute(`UPDATE fila_espera SET qtd_azul = ? WHERE hospitais_id = ?`,
        [qtd, id]);
      }

      //começa a fazer as coisas para atualzar o tempo de fila
      try{

        const [rowsPulseiras] = await conn.execute(
          `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE hospitais_id = ?`,
          [id]
        );

        await conn.execute(`UPDATE fila_espera SET tempo_espera = 0 WHERE hospitais_id = ?`, [id]);
      
        //valida se trouxe as qtd de pulseira
        if (!rowsPulseiras || rowsPulseiras.length === 0) {
          throw new Error("não há nenhum registro de paciente encontrado");
        }

        //descontroi a row para obter as qtd de pulseiras
        const {
          qtd_laranja: laranjas,
          qtd_amarelo: amarelos,
          qtd_verde: verdes,
          qtd_azul: azuis,
        } = rowsPulseiras[0];

        console.log(`afr: lrj: ${laranjas} amr: ${amarelos} vrd: ${verdes} azs: ${azuis}`);

        //obtem a qtd de médico(qtd) e porcentagem de médicos livres(qtd_livre)
        const [rowsMedicos] = await conn.execute(
          `SELECT qtd, qtd_livres FROM qtd_medicos WHERE hospitais_id = ?`,
          [id]
        );
    
        //valida se retornou
        if (!rowsMedicos || rowsMedicos.length === 0) {
          throw new Error("não há nenhum registro de medico");
        }
    
        //desconstroi a row
        let { qtd: qtdMedicos, qtd_livres: qtdMedicosLivre} = rowsMedicos[0]
    
        //chama e envia os parametros para o helper que calcula o tempo estimado de espera
        const tempoEstimado = await formulaCalcularPulseira(qtdMedicos, qtdMedicosLivre, laranjas, amarelos, verdes, azuis);

        //valida se o tempo estimado foi executado com sucesso
        if (!tempoEstimado && tempoEstimado !== 0) throw new Error('Erro ao calcular tempo estimado');

        //atualiza a estimativa de espera na fila
        await conn.execute(`UPDATE fila_espera SET tempo_espera = ? WHERE hospitais_id = ?`, [tempoEstimado, id]);
        console.log(`tempo estimado em minutos: ${tempoEstimado}`);

    
      }catch(error){
        console.error('Erro interno ao estimar fila:', error);
        return {error:`Erro ao estimar o tempo de fila`};
      }
  
      return { message: "Fila atualizado com sucesso" };
    } catch (err) {
      console.error(err);
      return { error: "Erro ao atualizar Fila", err };
    } finally {
      //libera a conexão
      conn?.release();
    }
  },

  updateHospitalService: async (hospital:any)=>{
    //desconstroi o "body"
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

    //valida se o id veio
    if (!id) return { error: "ID do hospital é obrigatório" };

    //declara conexão
    let conn:any;

    try {
      //chama a conexão
      conn = await connection();

      const calcularTempoFilaEspera = async (id: number) => {
        try{
          //obtem as qtd de pulseira
          const [rowsPulseiras] = await conn.execute(
            `SELECT qtd_laranja, qtd_amarelo, qtd_verde, qtd_azul FROM fila_espera WHERE hospitais_id = ?`,
            [id]
          );

          await conn.execute(`UPDATE fila_espera SET tempo_espera = 0 WHERE hospitais_id = ?`, [id]);
          
          //valida se trouxe as qtd de pulseira
          if (!rowsPulseiras || rowsPulseiras.length === 0) {
            throw new Error("não há nenhum registro de paciente encontrado");
          }

          //descontroi a row para obter as qtd de pulseiras
          const {
            qtd_laranja: laranjas,
            qtd_amarelo: amarelos,
            qtd_verde: verdes,
            qtd_azul: azuis,
          } = rowsPulseiras[0];

          //obtem a qtd de médico(qtd) e porcentagem de médicos livres(qtd_livre)
          const [rowsMedicos] = await conn.execute(
            `SELECT qtd, qtd_livres FROM qtd_medicos WHERE hospitais_id = ?`,
            [id]
          );

          //valida se retornou
          if (!rowsMedicos || rowsMedicos.length === 0) {
            throw new Error("não há nenhum registro de medico");
          }

          //desconstroi a row
          let { qtd: qtdMedicos, qtd_livres: qtdMedicosLivre} = rowsMedicos[0]

          //chama e envia os parametros para o helper que calcula o tempo estimado de espera
          const tempoEstimado = formulaCalcularPulseira(qtdMedicos, qtdMedicosLivre, laranjas, amarelos, verdes, azuis);

          //valida se o tempo estimado foi executado com sucesso
          if(!tempoEstimado) throw new Error;

          //atualiza a estimativa de espera na fila
          await conn.execute(`UPDATE fila_espera SET tempo_espera = ? WHERE hospitais_id = ?`, [tempoEstimado, id]);
          console.log(tempoEstimado)

        }catch(error){
          return {error:`Erro ao estimar o tempo de fila`}
        }
      };

      //sequencia de verificação e inserts dos campos enviados no body

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

      //verifica se foi atualizado as pulseiras a atualiza a estimativa
      if(
      (qtdd_azul !== undefined && qtdd_azul !== null)||
      (qtdd_verde !== undefined && qtdd_verde !== null)||
      (qtdd_amarelo !== undefined && qtdd_amarelo !== null)||
      (qtdd_laranja !== undefined && qtdd_laranja !== null)){
        const calcTempEspera:any = calcularTempoFilaEspera(id);
        if(calcTempEspera.error || !calcTempEspera){
          return [{ message: "Hospital atualizado com sucesso" }, { error: "erro ao atualizar o tempo de espera" }]
        }
      }
  
      return { message: "Hospital atualizado com sucesso" };
    } catch (err) {
      console.error(err);
      return { error: "Erro ao atualizar hospital", err };
    } finally {
      //libera a conexão
      conn?.release();
    }
  },

  deleteHospitalService: async (id: any) => {
    //declara conexão
    let conn;
    try {
      //chama conexão
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
      //libera a conexão
      conn?.release();
    }
  },

};

export {connection};

export default hospitalService;