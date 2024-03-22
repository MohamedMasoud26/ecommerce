import auth from '../../middleware/auth.js';
import { endPoint } from './cart.endPoint.js';
import * as cartController from './controller/cart.js'
import { Router } from "express";
const router = Router()




router.post('/',auth(endPoint.create),cartController.createCart)




export default router 