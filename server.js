import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import { authRouter } from "./services/routes/auth.route.js";
import cors from "cors";

// Abilitiamo l'uso dei file .env in ambiente express
config();

// Crea l'istanza del server
const app = express();

// Inizializza la porta
const PORT = process.env.PORT || 3001;

// CORS
const whitelist = ["https://epicode-deploy.vercel.app/"]; // assuming front-end application is running on localhost port 3000

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsoptions));

// Utilizziamo i file JSON nei dialoghi tra client e server attraverso il Middleware json()
app.use(express.json());

// Usiamo il route di autenticazione
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("server listening");
});

// Funzione per avviare il server
const initServer = async () => {
  try {
    // Connettiti al database
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connesso al database");

    // Ascolta alla porta
    app.listen(PORT, () => {
      console.log(`Il server sta ascoltando alla porta ${PORT}`);
    });
  } catch (err) {
    console.error("Connessione fallita!", err);
  }
};

// Avvia il server
initServer();
