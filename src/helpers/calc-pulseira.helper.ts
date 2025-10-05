export async function formulaCalcularPulseira(
    //tipação dos parametros
    qtdMedicos:number, 
    qtdMedicosLivre:number, 
    laranjas:number, 
    amarelos:number, 
    verdes:number, 
    azuis:number
): Promise<number>{
    //prepara o divisor
    const divisor = 
    qtdMedicosLivre > 0 ? qtdMedicosLivre : qtdMedicos;
    
    //define a media peso de cada pulseira
    const media_atendimento_laranja = 240;
    const media_atendimento_amarelo = 120;
    const media_atendimento_verde = 60;
    const media_atendimento_azul = 10;
    
    //declara o peso
    const peso = {
        laranja: media_atendimento_laranja,
        amarelo: media_atendimento_amarelo,
        verde: media_atendimento_verde,
        azul: media_atendimento_azul,
    };
    
    //calcula a carga total de tempo multiplicando a quantidade de cada pulseira pelo seu peso em específico no tempo de espera
    let cargaTotal = (laranjas * peso.laranja) + (amarelos * peso.amarelo) + (verdes * peso.verde) + (azuis * peso.azul);

    // modificadores de tempo com base na qtd de pulseiras
    if(laranjas === 0 && amarelos === 0 && verdes === 0){
        cargaTotal *= 1;
    }else{
        if (laranjas === 0){
            cargaTotal *= 0.5;
        }else{
            if (laranjas === 0 && amarelos === 0) cargaTotal *= 0.4;
        }
    }


    //tira o produto da cargaTotal pelo divisor, tendo assim o tempo estimado
    let totalTempoEstimado:any = Math.floor((cargaTotal / divisor));
    
    return totalTempoEstimado;
}
