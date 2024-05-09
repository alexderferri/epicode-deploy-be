import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Funzione per generare il token
export const generateJWT = (payload) => {
  // Restituiamo una promise
  return new Promise((resolve, reject) => {
    // Facciamo il sign del JWT
    jwt.sign(
      // Inseriamo il payload (dati)
      payload,
      // Inseriamo il JWT secret preso dal file .env
      process.env.JWT_SECRET,
      // Assegnamo la data di scadenza del token
      { expiresIn: "1d" },
      // Callback che prende l'errore (in caso di errore) e il token generato
      (err, token) => {
        // C'è stato un errore
        if (err) {
          // Reject della promise con l'errore
          reject(err);
        } else {
          // Resolve della promise con il token generato
          resolve(token);
        }
      }
    );
  });
};

// Funzione per verificare la validità del token
export const verifyJWT = (token) => {
  // Restituisci una promise
  return new Promise((resolve, reject) => {
    // Verifica il token con la funzione di libreria "verify"
    jwt.verify(
      // Passiamo il token fornito alla funzione
      token,
      // Passiamo il JWT secret del file .env
      process.env.JWT_SECRET,
      // Callback che ci retistuisce err in caso di errore e decoded (versione decodificata del token) in caso di successo
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
};

// Middleware da utilizzare nelle richieste che necessitano l'autorizzazione
export const authMiddleware = async (req, res, next) => {
  try {
    // Non è stato fornito il token nell'header
    if (!req.headers.authorization) {
      // Richiedi il login
      res.status(400).send("Effettua il login");
    } else {
      // Ci è stato fornito il token nell'header

      // Andiamo a togliere la stringa "Bearer " dal token fornito nell'header e verifichiamo il token attraverso la funzione verifyJWT
      const decoded = await verifyJWT(
        req.headers.authorization.replace("Bearer ", "")
      );

      // Il token esiste? Verificamo attraverso la sua proprietà exp
      if (decoded.exp) {
        // Andiamo ad eliminare dall'oggetto decoded issuedAt e expiredAt
        delete decoded.iat;
        delete decoded.exp;

        // Andiamo a trovare l'utente con i dati del payload
        const me = await User.findOne({
          ...decoded,
        });

        // Utente trovato
        if (me) {
          // Aggiungiamo il parametro user all'oggetto request. req.user avrà tutti i dati dell'utente direttamente dal database
          req.user = me;
          next();
        } else {
          // Utente non trovato
          res.status(401).send("Utente non trovato");
        }
      } else {
        // Token non valido
        res.status(401).send("Rieffettua il login");
      }
    }
  } catch (err) {
    next(err);
  }
};
