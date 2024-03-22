import reviewModel from "../../../../DB/model/Review.model.js";
import orderModel from "../../../../DB/model/order.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";




export const createReview =asyncHandler(async(req,res,next)=>{

    const {productId}=req.params
    const {comment,rating}=req.body
    const order = await orderModel.findOne({
        userId:req.user._id,
        status:'delivered',
        "products.productId":productId
    })
    if (!order){ 
        return next(new Error('can not review product before bought it',{cause:400}))

    }
    if (await reviewModel.findOne({createdBy:req.user._id,productId,orderId:order._id})) {
        return next(new Error('already reviewed by you',{cause:400}))
    }
    await reviewModel.create({
        comment,
        rating,
        createdBy:req.user._id,
        orderId:order._id,
        productId
    })
    return res.status(201).json({message:"done"})

})

export const updateReview =asyncHandler(async(req,res,next)=>{

    const {productId,reviewId}=req.params
    const {comment,rating}=req.body
    
    await reviewModel.updateOne({_id:reviewId,productId },req.body)
    return res.status(201).json({message:"done"})

})

