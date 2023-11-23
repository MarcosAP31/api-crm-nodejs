import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import the 'fs' module for file system operations
import pool from '../database';
const uploadDestination = 'build/uploads/img';
// Ensure that the upload destination folder exists
if (!fs.existsSync(uploadDestination)) {
  fs.mkdirSync(uploadDestination, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDestination);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

class ContactController {
  public async list(req: Request, res: Response): Promise<void> {
    try {
      const contact = await pool.query('SELECT * FROM contact');
      res.json(contact);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = await pool.query('SELECT * FROM contact WHERE ContactId = ?', [id]);

      if (contact.length > 0) {
        res.json(contact[0]);
      } else {
        res.status(404).json({ text: "The contact doesn't exist" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  public async create(req: Request, res: Response): Promise<void> {
    try {

      await pool.query('INSERT INTO contact SET ?', [req.body]);
      res.json({ message: 'Contact saved' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await pool.query('UPDATE contact SET ? WHERE ContactId = ?', [req.body, id]);
      res.json({ message: 'Contact updated' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM contact WHERE ContactId = ?', [id]);
      res.json({ message: 'The contact was deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

const contactController = new ContactController();
export default contactController;