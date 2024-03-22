import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createProduct=Joi.object({
    name:Joi.string().min(2).max(150).required(),
    description:Joi.string().min(2).max(150000),
    size:Joi.array(),
    colors:Joi.array(),
    stock:Joi.number().positive().integer().min(1).required(),
    price:Joi.number().positive().min(1).required(),
    discount:Joi.number().positive().min(1),
    categoryId:generalFields.id, 
    subcategoryId:generalFields.id,
    brandId:generalFields.id,
    file:Joi.object({
        mainImage:Joi.array().items(generalFields.file.required()).length(1).required(),
        subImages:Joi.array().items(generalFields.file).min(1).max(5).required(),
    }).required()

}).required()

export const updateProduct=Joi.object({
    name:Joi.string().min(2).max(150),
    description:Joi.string().min(2).max(150000),
    size:Joi.array(),
    colors:Joi.array(),
    stock:Joi.number().positive().integer().min(1),
    price:Joi.number().positive().min(1),
    discount:Joi.number().positive().min(1),
    productId:generalFields.id,
    categoryId:generalFields.optionalId, 
    subcategoryId:generalFields.optionalId,
    brandId:generalFields.optionalId,
    file:Joi.object({
        mainImage:Joi.array().items(generalFields.file.required()).max(1),
        subImages:Joi.array().items(generalFields.file).min(1).max(5),
    }).required()

}).required()