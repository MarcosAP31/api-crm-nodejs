import { Request, Response } from 'express';

class IndexController {

    public index(req: Request, res: Response) {
        res.json({text: 'API is in /apistore/virtualstore'});
    }

}

export const indexController = new IndexController;