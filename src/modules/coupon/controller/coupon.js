
import cloudinary from '../../../utils/cloudinary.js'
import couponModel from '../../../../DB/model/Coupon.model.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js'


export const getCoupon= asyncHandler(async(req,res,next)=>{
    const coupons = await couponModel.find()
    return res.status(200).json({message:'done',coupons})
})

export const getOneCoupon= asyncHandler(async(req,res,next)=>{
    const {couponId}=req.params
    const coupon =await couponModel.findById(couponId)
    if(!coupon){
        return next(new Error('coupon not found',{cause:404}))
    }
    return res.status(200).json({message:'done',coupon})
})

export const createCoupon = asyncHandler( async (req,res,next)=>{
    const name=req.body.name.toLowerCase()
    if(await couponModel.findOne({name})){
        return next(new Error(`duplicated coupon name : ${name}`,{cause:409}))
    }
    if(req.file){
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/coupon/${name}`})       
        req.body.image={secure_url,public_id}
    }
    req.body.expireDate=new Date(req.body.expireDate)
    req.body.createdBy = req.user._id
    const  coupon = await couponModel.create(req.body)
    return res.status(201).json({message:"done ",coupon} )
})

export const updateCoupon = asyncHandler( async (req,res,next)=>{
    const coupon =await couponModel.findById(req.params.couponId)
    if(!coupon){
        return next(new Error('coupon not found',{cause:404}))
    }
    
    if(req.body.name){
        req.body.name = req.body.name.toLowerCase()
        if(coupon.name==req.body.name){
            return next(new Error(`sorry cannot update coupon with the same name`,{cause:400}))
    
        }
        if(await couponModel.findOne({name:req.body.name})){
            return next(new Error(`duplicated coupon name : ${req.body.name}`,{cause:409}))
        }
        coupon.name= req.body.name
    }
    if (req.body.amount) {
        coupon.amount= req.body.amount
    }
    if (    req.body.expireDate) {
        coupon.expireDate=new Date(req.body.expireDate)
    }
    
    if(req.file){
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/coupon/${coupon.name}`})
    if(coupon.image) {
        await cloudinary.uploader.destroy(coupon.image.public_id)  
    }
    coupon.image={secure_url,public_id}
    }
    coupon.updatedBy = req.user._id
    await coupon.save()
    return res.status(200).json({message:"done ",coupon} )
})