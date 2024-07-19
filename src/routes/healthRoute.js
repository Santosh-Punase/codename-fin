import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => res.status(201).json({ message: 'Hello There!' }));

export default router;
