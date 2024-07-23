import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => res.status(201).json({ message: 'Hello There!' }));
router.get('/ip', (request, response) => response.send(request.ip));

export default router;
