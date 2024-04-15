import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import { login, getUserProfile } from "./controllers/authController.js";
import bookRoutes from "./routes/bookRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.post("/login", async (req, res) => {
  try {
    const token = await login(req.body, prisma);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login bem-sucedido" });
  } catch (error) {
    console.error("Erro durante o login:", error.message);
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

app.get("/home", authenticateToken, async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.userId, prisma);
    res.json(userProfile);
  } catch (error) {
    console.error("Erro ao obter o perfil do usuário:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rotas para operações CRUD de livros
app.use("/livros", bookRoutes);

// Utilize as rotas de empréstimos
app.use("/emprestimos", loanRoutes);

// Rotas para operações CRUD de equipamentos
app.use("/equipamentos", equipmentRoutes);

// Rotas para agendamento
app.use("/agendamentos", scheduleRoutes);

app.use((err, req, res, next) => {
  console.error("Erro interno do servidor:", err.message);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor em execução na porta ${PORT} 🚀`);
});
