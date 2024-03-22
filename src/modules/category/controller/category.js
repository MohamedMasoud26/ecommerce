
import cloudinary from './../../../utils/cloudinary.js'
import categoryModel from '../../../../DB/model/Category.model.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js'


export const getCategory= asyncHandler(async(req,res,next)=>{
    const categories = await categoryModel.find().populate([{
         path: 'subcategory'
    }])
    return res.status(200).json({message:'done',categories})
})

 export const getOneCategory= asyncHandler(async(req,res,next)=>{
    const {categoryId}=req.params
    const category =await categoryModel.findById(categoryId).populate([{
        path: 'subcategory'
   }])
    if(!category){
        return next(new Error('category not found',{code:404}))
    }
    return res.status(200).json({message:'done',category})
})

export const createCategory = asyncHandler( async (req,res,next)=>{
    const name=req.body.name.toLowerCase()
    if(await categoryModel.findOne({name})){
        return next(new Error(`duplicated category name : ${name}`,{cause:409}))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/category/${name}`})
    const  category = await categoryModel.create({
        name,
        slug:slugify(name,'-'),
        image:{secure_url,public_id},
        createdBy:req.user._id
    })
    return res.status(201).json({message:"done ",category} )
})

export const updateCategory = asyncHandler( async (req,res,next)=>{
    const category =await categoryModel.findById(req.params.categoryId)
    if(!category){
        return next(new Error('category not found',{code:404}))
    }
    
    if(req.body.name){
        req.body.name=req.body.name.toLowerCase()
        if(category.name==req.body.name){
            return next(new Error(`sorry cannoyt update category with the same name`,{cause:400}))
    
        }
        if(await categoryModel.findOne({name:req.body.name})){
            return next(new Error(`duplicated category name : ${req.body.name}`,{cause:409}))
        }
        category.name= req.body.name
        category.slug=slugify(req.body.name,'-')
    }
    
    if(req.file){
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path ,{folder:`${process.env.APP_NAME}/category/${category.name}`})
    await cloudinary.uploader.destroy(category.image.public_id)   
    category.image={secure_url,public_id}
    }
    category.updatedBy=req.user._id

    await category.save()
    return res.status(200).json({message:"done ",category} )
})