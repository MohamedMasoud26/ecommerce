import * as subcategoryController from './controller/subcategory.js'
import { fileUpload, fileValidation} from '../../utils/multer.js'
import * as validators from './subcategory.validation.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import auth from '../../middleware/auth.js';
import { endPoint } from './subcategory.endPoint.js';
const router = Router({mergeParams:true})


router.get('/',subcategoryController.getSubcategory)
router.get('/:subcategoryId',
validation(validators.getOneSubcategory),
subcategoryController.getOneSubcategory)

router.post('/',auth(endPoint.create),
fileUpload(fileValidation.image).single('image'),
validation(validators.createSubcategory),
subcategoryController.createSubcategory)

router.put('/:subcategoryId',auth(endPoint.update),
fileUpload(fileValidation.image).single('image'),
validation(validators.updateSubcategory),
subcategoryController.updateSubcategory)

export default router
