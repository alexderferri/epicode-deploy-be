import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { authMiddleware, generateJWT } from "../auth/index.js";

// Esporta il Router di autenticazione
export const authRouter = Router();

// Login Page
authRouter.get("/", async (req, res, next) => {
  res.send("Login Page");
});

// Register Endpoint
authRouter.post("/register", async (req, res, next) => {
  try {
    // Crea nuovo utente
    let user = await User.create({
      // Crea l'utente con tutte le informazioni passate nel body
      ...req.body,
      // Escludi password, perchè verrà gestita diversamente
      password: await bcrypt.hash(req.body.password, 10),
    });

    //sendEmail(`<h1>${req.body.username} ti sei registrato correttamente</h1>`, req.body.email);

    res.send(user);
  } catch (err) {
    next(err);
  }
});

// Login Endpoint
authRouter.post("/login", async (req, res, next) => {
  try {
    // Trova l'utente con lo username inserito nella richiesta
    let userFound = await User.findOne({
      username: req.body.username,
    });

    // L'utente è stato trovato?
    if (userFound) {
      // La password coincide?
      const isPasswordMatching = await bcrypt.compare(
        req.body.password,
        userFound.password
      );

      // La password coincide
      if (isPasswordMatching) {
        // Genera Token
        const token = await generateJWT({
          username: userFound.username,
        });

        // Mandiamo in risposta l'utente trovato e il token assegnato
        res.send({ user: userFound, token });
      } else {
        res.status(400).send("Password sbagliata");
      }
    } else {
      res.status(400).send("Utente non trovato");
    }
  } catch (err) {
    next(err);
  }
});

// Endpoint in cui l'autenticazione è necessaria
authRouter.get("/profile", authMiddleware, async (req, res, next) => {
  // Utilizzando il middleware authMiddleware, l'oggetto  req avrà il parametro user popolato con i dati presi dal database
  try {
    let user = await User.findById(req.user.id);

    res.send(user);
  } catch (err) {
    next(err);
  }
});
