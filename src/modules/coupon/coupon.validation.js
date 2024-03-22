import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const createCoupon =  joi.object({
        name: joi.string().min(2).max(25).required(),
        amount:joi.number().min(1).max(100).positive().required(),
        expireDate:joi.date().required().greater(Date.now()),
        file:generalFields.file,
    }).required()
    export const updateCoupon =  joi.object({
        couponId :generalFields.id,
        name: joi.string().min(2).max(25),
        amount:joi.number().min(1).max(100).positive(),
        expireDate:joi.date().greater(Date.now()),
        file:generalFields.file,
    }).required()

    export const getOneCoupon =  joi.object({
        couponId :generalFields.id
    }).required()