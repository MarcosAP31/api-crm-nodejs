import express, { Application } from 'express';
import morgan from 'morgan';

import bodyParser from 'body-parser';
import multer from 'multer';

import pool from './database';
import path from 'path';
const fs = require('fs');
import cors from 'cors';
//import getMessagesByConversationId from './controllers/messageController';
import indexRoutes from './routes/indexRoutes';
import contactRoutes from './routes/contactRoutes';
import fileRoutes from './routes/fileRoutes';
const WebSocket = require('ws');
const jwt = require("jsonwebtoken");
const http = require('http');
import { Server as SocketIOServer } from 'socket.io';


class Server {

  public app: any;
  public io: any; // Variable para el servidor de Socket.io
  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config(): void {

    this.app.set('port', process.env.PORT || 3000);

    this.app.use(morgan('dev'));
    this.app.use(cors());

    this.app.use(express.json());

    this.app.use(express.urlencoded({ extended: false }));

  }

  routes(): void {

    this.app.use('/', indexRoutes);
    this.app.use('/apistore/contacts', contactRoutes);
    this.app.use('/apistore/file', fileRoutes);
    // Ruta para guardar imagenes
    this.app.use("/build/uploads/img", express.static(path.join(__dirname, "uploads/img")));
    const storage = multer.diskStorage({
      destination: (req, file, callBack) => {
        callBack(null, "build/uploads/img");
      },
      filename: (req, file, callBack) => {
        callBack(null, file.originalname);
      },
    });
    const upload = multer({ storage: storage });
    this.app.get("/apistore/upload", (req: any, res: any) => {
      pool.query(
        "SELECT * FROM  file",
        (err: any, rows: any, fields: any) => {
          if (!err) {
            res.json(rows);
          } else {
            console.log(err);
          }
        }
      );
    });
    this.app.post(
      "/apistore/saveimg",
      upload.single("file"),
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Check if req.file is defined before accessing its properties
        
        const file: any = req.file;

        const filesImg = {
          FileId: null,
          Name: file.filename,
          Image: file.path,
          Date: new Date()
        };

        if (!file) {
          const error: any = new Error("No File");
          error.httpStatusCode = 400;
          return next(error);
        }

        res.send(file);
      
        console.log(filesImg);

        pool.query("INSERT INTO file set ?", [filesImg]);
        
        //res.json({ message: 'File saved' });
      }
    );
    this.app.delete("/apistore/file/:id", (req: express.Request, res: express.Response) => {
      const { id } = req.params;
      deleteFile(id);
      pool.query("DELETE FROM file WHERE FileId = ?", [id]);
      res.json({ message: "The file was deleted" });
    });
    async function deleteFile(id: number) {
      const files = await pool.query("SELECT * FROM  file WHERE FileId = ?", [id]);
      const filePath = './' + files[0].Image;
      fs.unlink(filePath, (err: any) => {
        if (err) {
          console.error('Error al eliminar el archivo:', err);
          return;
        }
        console.log('Archivo eliminado exitosamente');
      });
    }
  }


  start() {
    const server = http.createServer(this.app);
    // Crear servidor WebSocket
    const wss = new WebSocket.Server({ server });

    // Manejar eventos de conexión WebSocket
    wss.on('connection', (ws: any) => {
      console.log('Nueva conexión WebSocket');

      // Manejar eventos de mensajes recibidos
      ws.on('message', (message: any) => {
        console.log('Mensaje recibido:', message.toString('utf8'));
        // Enviar mensaje de vuelta al cliente
        wss.clients.forEach((client: any) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('¡Hola cliente!');
          }
        });
        //ws.send('¡Hola cliente!');
      });

      // Manejar eventos de cierre de conexión
      ws.on('close', () => {
        console.log('Conexión WebSocket cerrada');
      });
    });
    server.listen(this.app.get('port'), () => {
      console.log('Server on port', this.app.get('port'));
      /*// Configurar Socket.io
      this.io = new SocketIOServer(server, { path: '/socket.io/' });

      // Agregar el middleware de Socket.io al servidor de Express
      this.app.io = this.io;

      // Escuchar eventos de conexión de Socket.io
      this.io.on('connection', (socket: any) => {
        console.log('Nuevo cliente conectado');

        // Escuchar evento "mensaje" del cliente
        socket.on('mensaje', (data: any) => {
          console.log('Mensaje recibido:', data);

          // Enviar mensaje de vuelta al cliente
          socket.emit('respuesta', '¡Hola cliente!');
        });

        // Manejar evento de desconexión del cliente
        socket.on('disconnect', () => {
          console.log('Cliente desconectado');
        });
      });*/
    });
    /*
    this.app.listen(this.app.get('port'), () => {
        console.log('Server on port', this.app.get('port'));
    });*/
  }
}

const server = new Server();
server.start();