import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const createSubcategory =  joi.object({
        name: joi.string().min(2).max(25).required(),
        file:( generalFields.file.required()).required(),
        categoryId :generalFields.id,
    }).required()
    export const updateSubcategory =  joi.object({
        subcategoryId :generalFields.id,
        categoryId :generalFields.id,
        name: joi.string().min(2).max(25),
        file:( generalFields.file.required()),
    }).required()

    export const getOneSubcategory =  joi.object({
        subcategoryId :generalFields.id
    }).required()