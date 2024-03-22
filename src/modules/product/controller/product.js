import subcategoryModel from '../../../../DB/model/subCategory.model.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import slugify from 'slugify'
import cloudinary from '../../../utils/cloudinary.js'
import { nanoid } from 'nanoid'
import {asyncHandler} from '../../../utils/errorHandling.js'
import productModel from '../../../../DB/model/Product.model.js'


export const productList=asyncHandler(async(req,res,next)=>{
    const products =await productModel.find().populate([
        {
            path:'review',
        }
    ])
    for (let i = 0; i < products.length; i++) {
        let calcRating=0
        for (let j = 0; j < products[i].review.length; j++) {
            calcRating +=products[i].review[j].rating
            
        }
        let avgRating= calcRating / products[i].review.length
        const product=products[i].toObject()
        product.avgRating = avgRating
        products[i]=product
    }
    return res.status(200).json({message:"done",products})

})
export const createProduct =asyncHandler(async(req,res,next)=>{
        const {name ,categoryId , subcategoryId ,brandId ,discount,price}=req.body
    
        if(! await subcategoryModel.findOne({_id:subcategoryId,categoryId})){
            return next(new Error('in-valid category or subcategory ID',{cause:400}))
        }
        if(! await brandModel.findOne({_id:brandId})){
            return next(new Error('in-valid brand ID',{cause:400}))
        }
    
        req.body.slug = slugify(name ,{
            replacement:'-',
            trim:true,
            lower:true
        })
        req.body.finalPrice=Number.parseFloat(price-(price*((discount||0)/100))).toFixed(2)
        req.body.customId=nanoid()
        const {secure_url,public_id} =await cloudinary.uploader.upload(req.files.mainImage[0].path,
            {folder:`${process.env.APP_NAME}/product/${req.body.customId}`})
        req.body.mainImage={secure_url,public_id}
        
        if(req.files.subImages){
            req.body.subImages=[]
            for(const file of req.files.subImages){
                const {secure_url,public_id} =await cloudinary.uploader.upload(file.path,
                    {folder:`${process.env.APP_NAME}/product/${req.body.customId}/subImages`})
                    req.body.subImages.push({secure_url,public_id})
            }
        }
        req.body.createdBy= req.user._id
        const product = await productModel.create(req.body)
        if(!product){
            return next(new Error('failed to create this product',{cause:400}))
        }
        return res.status(201).json({message:"done",product})
    
    
    })


export const updateProduct =asyncHandler(async(req,res,next)=>{
        const {productId} =req.params
        const product= await productModel.findById(productId)
        if(! product){
                return next(new Error('in-valid product ID',{cause:400}))
        }

        const {name ,categoryId , subcategoryId ,brandId ,discount,price}=req.body
        if (categoryId && subcategoryId) {
            if(! await subcategoryModel.findOne({_id:subcategoryId,categoryId})){
                return next(new Error('in-valid category or subcategory ID',{cause:400}))
            }}

        if (!!brandId) {
        if(! await brandModel.findOne({_id:brandId})){
            return next(new Error('in-valid brand ID',{cause:400}))
        }}

        if (name) {
            req.body.slug = slugify(name ,{
                replacement:'-',
                trim:true,
                lower:true
            })
        }
        if(price && discount){
        req.body.finalPrice=Number.parseFloat(price-(price*((discount||0)/100))).toFixed(2)
        }else if(price){
        req.body.finalPrice=Number.parseFloat(price-(price*((product.discount)/100))).toFixed(2)
        }else if(discount){
        req.body.finalPrice=Number.parseFloat(price-(product.price*((discount)/100))).toFixed(2)
        }

        if(req.files?.mainImage?.length){
            const {secure_url,public_id} =await cloudinary.uploader.upload(req.files.mainImage[0].path,
                {folder:`${process.env.APP_NAME}/product/${product.customId}`})
                await cloudinary.uploader.destroy(product.mainImage.public_id)
            req.body.mainImage={secure_url,public_id}
        }
        
        
        if(req.files?.subImages?.length){
            req.body.subImages=[]
            console.log(product.customId);
            for(const file of req.files.subImages){
                const {secure_url,public_id} =await cloudinary.uploader.upload(file.path,
                    {folder:`${process.env.APP_NAME}/product/${product.customId}/subImages`})
                    for (const subImages of product.subImages) {
                        await cloudinary.uploader.destroy(subImages.public_id);
                    }
                    req.body.subImages.push({secure_url,public_id})
            }
        }
        req.body.updatedBy= req.user._id
        const newProduct = await productModel.updateOne({_id:product._id},req.body)
        return res.status(200).json({message:"done"})
    })    