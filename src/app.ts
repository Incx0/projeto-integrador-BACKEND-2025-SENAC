// Importando bibliotecas principais
import express from 'express';
import cors from 'cors';
// Importando conexões de banco de dados
import dbMysql from './database/dbMysql.js';
// Importando routes
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';

// Inicializando o "app"
const app = express();
// Porta do servidor
const port: number = 3000;

// Conectando ao banco de dados
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
app.use("/auth", authRoute);

// Iniciando server
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

//obs: estou aprendendo a usar o typescript(só sei js e quase nada de php) até o presente momento de dev da api, ter paciência
//ps: sei html e css, mas nn é liguagem de progamação ;)