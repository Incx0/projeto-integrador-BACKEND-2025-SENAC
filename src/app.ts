// Importando bibliotecas principais
import express from 'express';
import cors from 'cors';
// Importando conexões de banco de dados
import dbMysql from './database/dbMysql.js';
// Importando routes
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import hospitalRoute from './routes/hospital.route.js';

//env
import dotenv from "dotenv";
dotenv.config();

// Inicializando o "app"
const app = express();
// Porta do servidor de producao
const port: number = 2324;

// Conectando ao banco de dados
dbMysql.connect();

// Middlewares(processa reqs e res's escrevi bunito agr)
app.use(express.json());

//configuração do cors
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/hospital", hospitalRoute);

// Iniciando server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server rodando em projeto-integrador-backend-2025-senac.onrender.com (ou para teste internos localhost:${port})`);
});

//obs: estou aprendendo a usar o typescript(só sei js e quase nada de php) até o presente momento de dev da api, ter paciência
//ps: sei html e css, mas nn é liguagem de progamação ;)
