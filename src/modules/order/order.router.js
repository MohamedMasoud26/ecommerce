import * as orderController from './controller/order.js'
import * as validators from './order.validation.js'
import {auth} from '../../middleware/auth.js';
import { Router } from "express";
import { endPoint } from './order.endPoint.js';
import { validation } from '../../middleware/validation.js';
const router = Router()




router.post('/', auth(endPoint.create),
validation(validators.createOrder),
orderController.createOrder )

router.patch('/:orderId/Admin', auth(endPoint.adminUpdateOrder),
validation(validators.adminUpdateOrder),
orderController.adminUpdateOrder )

router.patch('/:orderId', auth(endPoint.cancelOrder),
validation(validators.cancelOrder),orderController.cancelOrder )




export default router