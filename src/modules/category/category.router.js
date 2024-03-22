
import subcategory from '../subcategory/subcategory.router.js'
import * as categoryController from './controller/category.js'
import { fileUpload, fileValidation} from '../../utils/multer.js'
import * as validators from './category.validation.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import {auth, roles} from '../../middleware/auth.js';
import { endPoint } from './category.endPoint.js';
const router = Router()



router.use('/:categoryId/subcategory',subcategory);

router.get('/',categoryController.getCategory)
router.get('/:categoryId',auth(Object.values(roles)),
validation(validators.getOneCategory),
categoryController.getOneCategory) 

router.post('/',auth(endPoint.create),
fileUpload(fileValidation.image).single('image'),
validation(validators.createCategory),
categoryController.createCategory)

router.put('/:categoryId',auth(endPoint.create),
fileUpload(fileValidation.image).single('image'),
validation(validators.updateCategory),
categoryController.updateCategory)






export default router