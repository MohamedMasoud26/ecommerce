

import brand from '../brand/brand.router.js'
import * as brandController from './controller/brand.js'
import { fileUpload, fileValidation} from '../../utils/multer.js'
import * as validators from './brand.validation.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth,  roles } from '../../middleware/auth.js';
import { endPoint } from '../category/category.endPoint.js';
const router = Router()


router.get('/',brandController.getBrand)
router.get('/:brandId',auth(),
validation(validators.getOneBrand),
brandController.getOneBrand) 

router.post('/',auth(endPoint.create),
fileUpload(fileValidation.image).single('image'),
validation(validators.createBrand),
brandController.createBrand)

router.put('/:brandId',auth(endPoint.update),
fileUpload(fileValidation.image).single('image'),
validation(validators.updateBrand),
brandController.updateBrand)








export default router