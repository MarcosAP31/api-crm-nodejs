import express, { Router } from 'express';
import contactController from '../controllers/contactController';

class ContactRoutes {

    router: Router = Router();

    constructor() {
        this.config();
    }

    config() {

        this.router.get('/', contactController.list);
        this.router.get('/:id', contactController.getOne);
        this.router.post('/', contactController.create);
        this.router.put('/:id', contactController.update);
        this.router.delete('/:id', contactController.delete);

    }

}

export default new ContactRoutes().router;

