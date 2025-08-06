// Importando bibliotecas principais
import express from 'express';
import cors from 'cors';

// Importando conexões de banco de dados
//import dbMysql from './src/database/dbMysql';

// Importando rotas
//import userRoute from './src/routes/user.route';
//import produtoRoute from './src/routes/produto.route';
//import categoriaRoute from './src/routes/categoria.route';
//import pedidoRoute from './src/routes/pedido.route';
//import encomendaRoute from './src/routes/encomenda.route';
//import notaFiscalRoute from './src/routes/notaFiscal.route';

// Inicializando o app
const app = express();

// Porta do servidor
const port: number = 3000;

// Conectando aos bancos de dados
//dbMysql.connect();

// Middlewares
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rotas
//app.use("/user", userRoute);
//app.use("/produto", produtoRoute);
//app.use("/categoria", categoriaRoute);
//app.use("/pedido", pedidoRoute);
//app.use("/encomenda", encomendaRoute);
//app.use("/nota-fiscal", notaFiscalRoute);

// Inicializando servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});