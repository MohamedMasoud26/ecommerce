import auth from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import * as reviewController from './controller/reviews.js'
import { endPoint } from './reviews.endPoint.js';
import * as validators from './reviews.validation.js'
import { Router } from "express";
const router = Router({mergeParams:true})




router.post('/',auth(endPoint.createReview),
validation(validators.createReview),
reviewController.createReview)

router.put('/:reviewId',auth(endPoint.updateReview),
validation(validators.updateReview),
reviewController.updateReview)




export default router