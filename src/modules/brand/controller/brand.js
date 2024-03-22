
import cloudinary from '../../../utils/cloudinary.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js'


export const getBrand= asyncHandler(async(req,res,next)=>{
    const brands = await brandModel.find()
    return res.status(200).json({message:'done',brands})
})

 export const getOneBrand= asyncHandler(async(req,res,next)=>{
    const {brandId}=req.params
    const brand =await brandModel.findById(brandId)
    if(!brand){
        return next(new Error('brand not found',{code:404}))
    }
    return res.status(200).json({message:'done',brand})
})

export const createBrand = asyncHandler( async (req,res,next)=>{
    const name=req.body.name.toLowerCase()
    if(await brandModel.findOne({name})){
        return next(new Error(`duplicated brand name : ${name}`,{cause:409}))
    }
    
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/brand/${name}`})       
        req.body.image={secure_url,public_id}
    
    const  brand = await brandModel.create({
        name,
        image:{secure_url,public_id},
        createdBy:req.user._id
    })
    return res.status(201).json({message:"done ",brand} )
})

export const updateBrand = asyncHandler( async (req,res,next)=>{
    const brand =await brandModel.findById(req.params.brandId)
    if(!brand){
        return next(new Error('brand not found',{code:404}))
    }
    
    if(req.body.name){
        req.body.name = req.body.name.toLowerCase()
        if(brand.name==req.body.name){
            return next(new Error(`sorry cannot update brand with the same name`,{cause:400}))
    
        }
        if(await brandModel.findOne({name:req.body.name})){
            return next(new Error(`duplicated brand name : ${req.body.name}`,{cause:409}))
        }
        brand.name= req.body.name
    }
    
    if(req.file){
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/brand/${brand.name}`})
        await cloudinary.uploader.destroy(brand.image.public_id)  
    
    brand.image={secure_url,public_id}
    }
    brand.updatedBy = req.user._id
    await brand.save()
    return res.status(200).json({message:"done ",brand} )
})