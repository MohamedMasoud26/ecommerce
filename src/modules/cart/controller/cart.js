import cartModel from "../../../../DB/model/Cart.model.js"
import productModel from "../../../../DB/model/Product.model.js"



export const createCart =async(req,res,next)=>{

    const {productId,quantity}= req.body

    const product =await productModel.findById(productId)
    if(!product){
        return next(new Error("in-valid product ID",{case:400}))
    }
    if (product.stock < quantity ||product.isDeleted) {
        await productModel.updateOne({_id:productId},{$addToSet:{wishUserList:req.user._id}})
        return next(new Error(`in-valid product quantity max available is ${product.stock}`,{case:400})) 
    }    
    const cart= await cartModel.findOne({userId:req.user._id})
    if(! cart){
        const newCart = await cartModel.create({
            userId:req.user._id,
            products:[{productId,quantity}]
        })
        return res.status(201).json({message:"cart created successfully",cart:newCart})
    }

    // if exist
    let matchProduct =false
    for (let i = 0; i < cart.products.length; i++) {
        if(cart.products[i].productId.toString()==productId) {
        cart.products[i].quantity = quantity
        matchProduct = true
        break;
        }
    }
    if (!matchProduct) {
        cart.products.push({productId,quantity})
    }
    await cart.save()
    return res.status(200).json({message:'updated cart',cart})

}