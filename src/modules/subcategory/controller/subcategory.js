
import cloudinary from './../../../utils/cloudinary.js'
import subcategoryModel from '../../../../DB/model/subCategory.model.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js'
import { nanoid } from 'nanoid'
import categoryModel from '../../../../DB/model/Category.model.js'


export const getSubcategory= asyncHandler(async(req,res,next)=>{
    const categories = await subcategoryModel.find()
    return res.status(200).json({message:'done',categories})
})

export const getOneSubcategory= asyncHandler(async(req,res,next)=>{
    const subcategory =await subcategoryModel.findById(req.params.subcategoryId)
    if(!subcategory){
        return next(new Error('subcategory not found',{code:404}))
    }
    return res.status(200).json({message:'done',subcategory})
})

export const createSubcategory = asyncHandler( async (req,res,next)=>{
    const {categoryId}=req.params

    console.log(categoryId);
    const category = await categoryModel.findById(categoryId)
    if(!category){
             return next(new Error(`in-valid category id `,{cause:400}))
    }
    const name=req.body.name.toLowerCase()
    if(await subcategoryModel.findOne({name})){
        return next(new Error(`duplicated subcategory name : ${name}`,{cause:409}))
    }
    const customId=nanoid()
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,
        {folder:`${process.env.APP_NAME}/category/${category.name}/${customId}`})
    const  subcategory = await subcategoryModel.create({
        name,
        slug:slugify(name,'-'),
        image:{secure_url,public_id},
        categoryId,
        customId,
        createdBy:req.user._id

    })
    return res.status(201).json({message:"done ",subcategory} )
})

export const updateSubcategory = asyncHandler( async (req,res,next)=>{
    const {subcategoryId,categoryId}=req.params
    const category = await categoryModel.findById(categoryId)
    const subcategory =await subcategoryModel.findOne({_id:subcategoryId,categoryId})
    if(!subcategory){
        return next(new Error('subcategory not found',{code:404}))
    }
    
    if(req.body.name){
        req.body.name = req.body.name.toLowerCase()
        if(subcategory.name==req.body.name){
            return next(new Error(`sorry cannoyt update subcategory with the same name`,{cause:400}))
    
        }
        if(await subcategoryModel.findOne({name:req.body.name})){
            return next(new Error(`duplicated subcategory name : ${req.body.name}`,{cause:409}))
        }
        subcategory.name= req.body.name
        subcategory.slug=slugify(req.body.name,'-')
    }
    
    if(req.file){
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,
        {folder:`${process.env.APP_NAME}/category/${category.name}/${subcategory.customId}`})
    await cloudinary.uploader.destroy(subcategory.image.public_id)   
    subcategory.image={secure_url,public_id}
    }
    subcategory.updatedBy = req.user._id
    await subcategory.save()
    return res.status(200).json({message:"done ",subcategory} )
})