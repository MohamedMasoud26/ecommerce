import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";



export const token=Joi.object({
    token:Joi.string().required(),
}).required()

export const signup =Joi.object({
    userName:Joi.string().min(2).max(20).required(),
    email:generalFields.email,
    password:generalFields.password,
    cPassword:generalFields.cPassword.valid(Joi.ref('password'))
}).required()

export const login =Joi.object({
    email:generalFields.email,
    password:generalFields.password,
}).required()

export const sendCode =Joi.object({
    email:generalFields.email,
    password:generalFields.password,
}).required()

export const forgetPassword =Joi.object({
    forgetCode:Joi.string().pattern(new RegExp(/^[0-9]{6}$/)).required(),
    email:generalFields.email,
    password:generalFields.password,
    cPassword:generalFields.cPassword.valid(Joi.ref('password'))
}).required()