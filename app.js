// Importando bibliotecas principais
import express from 'express';
import cors from 'cors';
// Importando conexões de banco de dados
import dbMysql from './src/database/dbMysql.js';
// Importando rotas
import userRoute from './src/routes/user.route';
// Inicializando o app
const app = express();
// Porta do servidor
const port = 3000;
// Conectando aos bancos de dados
dbMysql.connect();
// Middlewares(processa reqs e res's escrevi bunito agr)
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes
app.use("/user", userRoute);
// Iniciando server
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
