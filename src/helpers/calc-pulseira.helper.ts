export async function formulaCalcularPulseira(
    qtdMedicos:number, 
    qtdMedicosLivre:number, 
    laranjas:number, 
    amarelos:number, 
    verdes:number, 
    azuis:number
): Promise<number>{

  const divisor = 
  qtdMedicosLivre > 0 ? qtdMedicosLivre : qtdMedicos;
  
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
  
  const cargaTotal = (laranjas * peso.laranja) + (amarelos * peso.amarelo) + (verdes * peso.verde) + (azuis * peso.azul);
  
  if(peso.laranja === 0) cargaTotal*0.5;
  if(peso.laranja === 0 && peso.amarelo === 0) cargaTotal*0.25;
  
  const totalTempoEstimado = cargaTotal / divisor;

  return totalTempoEstimado;
}
