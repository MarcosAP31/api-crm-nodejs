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
    this.app.use('/apistore/contact', contactRoutes);

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
        wss.clients.forEach((client:any) => {
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