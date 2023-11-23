import express, { Router } from 'express';

import fileController from '../controllers/fileController';

class FileRoutes {

    router: Router = Router();

    constructor() {
        this.config();
    }

    config() {
        this.router.get('/name/:name', fileController.getByName);
    }
}

export default new FileRoutes().router;

