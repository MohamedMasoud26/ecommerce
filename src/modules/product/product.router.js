import * as productController from './controller/product.js'
import { validation } from '../../middleware/validation.js';
import * as validators from './product.validation.js'
import {fileUpload,fileValidation} from '../../utils/multer.js'
import reviewRouter from '../reviews/reviews.router.js'
import { Router } from "express";
import { endpoint } from './product.endPoint.js';
import auth from '../../middleware/auth.js';
const router = Router()


router.use("/:productId/review",reviewRouter)

router.get("/",productController.productList)
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
]),validation(validators.createProduct), productController.createProduct)

router.put('/:productId',auth(endpoint.update),fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
]),validation(validators.updateProduct), productController.updateProduct)




export default router