const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();
const OrderItems = require('../models/order-item')

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id).populate('user', 'name')
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}
        })

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.post('/', async (req,res)=>{
    let orderitemsid =Promise.all(req.body.orderItems.map( async (orderitem) =>{
        let newoderitems = new OrderItems({
            quantity:orderitem.quantity,
            product: orderitem.product
        })

        newoderitems = await newoderitems.save()
        
        return newoderitems._id
    }))
     
    const neworderitemsid = await orderitemsid

    const totalprices = await Promise.all(neworderitemsid.map(async (orderitemids)=>{
         const orderitems = await OrderItems.findById(orderitemids).populate('product','price')
         const totalprice = orderitems.product.price * orderitems.quantity
         return totalprice
    }))

    const totalprice = totalprices.reduce((a,b)=> a + b, 0)

    let order = new Order({
        orderItems: neworderitemsid,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        totalPrice: totalprice,
        user: req.body.user
       
    })
    order = await order.save()
    
    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.put('/:id',async(req,res)=>{
    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status:req.body.status,
        },
        {
            new:true
        }
    )
    if(order){
        return res.status(200).json({success:true,message:'order find successfully'})
    }else{
        return res.status(400).json({success:false,message:'order not found'})
    } 
})

router.delete('/:id',(req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async (order)=>{
       if(order){
              await order.OrderItems.map(async (orderitem)=>{
                await OrderItems.findByIdAndRemove(orderitem)
              })
              return res.status(200).json({success:true,message:'order deleted'})
       }else{
           return res.status(404).json({success:true,message:'order not found'})
       }
    }).catch(err=>{
       return res.status(400).json({success:false,error:err})
    })
})

router.get('/get/totalsum',async(req,res)=>{
    const totalSales = await Order.aggregate([
        { $group: {_id:null, totalsales:{$sum:'$totalPrices'}}}
    ])
    if(!totalSales){
        return res.status(400).json({message:'Server cant generate totalsales now'})
    }

    return res.status(200).send(totalSales)
})

router.get('/get/count',async (req,res)=>{
    const orderCount = await Order.countDocuments((count)=>count)
    if(!orderCount ){
        res.status(500).json({success:false})
    }
    res.status(200).json(orderCount)
})

module.exports = router;