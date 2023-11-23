import { Request, Response } from 'express';
import pool from '../database';
const fs = require('fs');
const jwt=require("jsonwebtoken");
var token=""
class FileController {
    
   

    public async getByName(req: Request, res: Response): Promise<any> {
        const { name } = req.params;
        const file = await pool.query('SELECT * FROM file WHERE Name = ?', [name]);
        console.log(file.length);
        if (file.length > 0) {
            return res.json(file[0]);
        }
        res.status(404).json({ text: "The client doesn't exits" });
    }
    
}


const fileController = new FileController;
export default fileController;