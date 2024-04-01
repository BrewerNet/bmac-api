// userRouter.ts

import express from 'express';
import { createUserHandler, getAllUsersHandler,getUserByIdHandler, updateUserHandler, deleteUserHandler } from '../controllers/UserController';

const router = express.Router();

router.post('/users', createUserHandler);
router.get('/users',getAllUsersHandler)
router.get('/users/:id', getUserByIdHandler);
router.put('/users/:id', updateUserHandler);
router.delete('/users/:id', deleteUserHandler);

export default router;
