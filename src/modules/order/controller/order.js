import cartModel from "../../../../DB/model/Cart.model.js"
import couponModel from "../../../../DB/model/Coupon.model.js"
import productModel from "../../../../DB/model/Product.model.js"
import orderModel from "../../../../DB/model/order.model.js"
import { asyncHandler } from "../../../utils/errorHandling.js"


export const createOrder =asyncHandler(async(req,res,next)=>{
    const{ products , address ,phone, note ,couponName ,paymentType}=req.body

    if (!req.body.products) {
       const cart =await cartModel.findOne({userId:req.user._id})
    if (!cart?.products?.length) {
       return next(new Error(`empty cart`,{cause:400}))
    }
    req.body.isCart=true
    req.body.products = cart.products
    }
    if (couponName) {
       const coupon =await couponModel.findOne({name:couponName.toLowerCase(),usedBy:{$nin:req.user._id}})
       if (!coupon || coupon.expireDate.getTime()<Date.now()){
       return next(new Error(`in-valid coupon name or it expired`,{cause:404}))
       }
       req.body.coupon= coupon
    }
    const finalProductList=[]
    let subtotal=0;
    const productIds=[]
    for (let product of req.body.products) {
       const checkedProduct =await productModel.findOne({
           _id:product.productId,
           stock:{$gte:product.quantity},
           isDeleted:false
       })
       if(!checkedProduct) {
           return next(new Error(`one of the items you ordered with id ${product.productId} not available`,{cause:400}));
       }
       if (req.body.isCart) {
           product=product.toObject()
       }
       productIds.push(product.productId);
       product.name=checkedProduct.name
       product.unitPrice=checkedProduct.finalPrice
       product.finalPrice=product.quantity * checkedProduct.finalPrice.toFixed(2)
       finalProductList.push(product)
       subtotal += product.finalPrice 

   }
   const order=await orderModel.create({
       userId: req.user._id,
       address,
       phone,
       note,
       products:finalProductList,
       couponId:req.body.coupon?._id,
       subtotal,
       finalPrice:subtotal - (subtotal * ((req.body.coupon?.amount || 0)/100)).toFixed(2),
       paymentType,
       totalDiscount:subtotal * ((req.body.coupon?.amount || 0)/100),
       status:paymentType =="card" ? "waitPayment" :'placed'
   })
   for (const product of req.body.products) {
       await productModel.updateOne({_id:product.productId}, {$inc:{stock:-parseInt(product.quantity)}})
   }
   if(req.body.coupon){
       await couponModel.updateOne({_id:req.body.coupon._id},{$addToSet:{usedBy:req.user._id}})
   }
   if (req.body.isCart) {
       await cartModel.updateOne({userId:req.user._id},{products:[]})

   }else{
       await cartModel.updateOne({userId:req.user._id},{
           $pull:{
               products:{
                   productId:{$in:productIds}
               }
           }
       })
   }
   
   return res.status(201).json({message:"done",order})
})

export const cancelOrder =asyncHandler(async(req,res,next) => {
    const {orderId}=req.params
    const {reason} =req.body
    const order = await orderModel.findOne({_id:orderId,userId:req.user._id})
    if (!order) {
        return next(new Error(`in-valid order id`,{cause:404}))
        
    }
    if((order?.status !="placed" && order.paymentType == 'cash')||(order?.status !="waitPayment" && order.paymentType == 'card')){
       return next(new Error(`can not cancel your order after it has been changed to ${order.status}`,{cause:400}))
    }
    const cancelOrder = await orderModel.updateOne({_id:order._id},{status:'canceled',reason,updatedBy:req.user._id})
    if (!cancelOrder.matchedCount) {
        return next(new Error(`fail to cancel your order`,{cause:400}))

    }
    for (const product of order.products) {
        await productModel.updateOne({_id:product.productId}, {$inc:{stock:parseInt(product.quantity)}})
    }
    if(order.couponId){
        await couponModel.updateOne({_id:order.couponId},{$pull:{usedBy:req.user._id}})
    }
    return res.status(200).json({message:"done"})
})

export const adminUpdateOrder =asyncHandler(async(req,res,next) => {
    const {orderId}=req.params
    const {status} =req.body
    const order = await orderModel.findOne({_id:orderId})
    if (!order) {
        return next(new Error(`in-valid order id`,{cause:404}))
        
    }
    const cancelOrder = await orderModel.updateOne({_id:order._id},{status,updatedBy:req.user._id})
    if (!cancelOrder.matchedCount) {
        return next(new Error(`fail to update your order`,{cause:400}))
    }
    return res.status(200).json({message:"done"})
})