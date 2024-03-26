
const { Category } = require('../models/category');
const {Products} = require('../models/product')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const file_type_map = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        const isValid = file_type_map[file.mimetype]
        let uploadError = new Error('Invalid image type')
        if(isValid){
            uploadError = null
        }
       cb(null,'public/uploads')
    },
    filename: function(req,file,cb){
        const filenames = file.originalname.replace('','-')
        const extension = file_type_map[file.mimetype]
        cb(null,`${filenames}-${Date.now()}.${extension}`)
    }
})

const uploadoptions = multer({storage:storage})

router.get(`/`,async(req,res)=>{
    let filter = {}
    if(req.request.categories){
         filter= {category:req.request.categories.split(',')}
    }
    const productlist = await Products.find(filter).populate('category');
    if(!productlist){
        res.status(500).json({success:false})
    }
    res.status(200).json(productlist)
})

router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(500).json({success:false})
    }
    res.status(200).json(product)
})

router.post(`/`,uploadoptions.single('image'),async (req,res)=>{
    const cat = await Category.findById(req.body.category)
    if(!cat) res.status(500).json({success:true},{message:'can not find category'})

    const file = req.file
    if(!file) res.status(500).json({success:true},{message:'image file not uploaded'})

    const fileName = req.file.filename
    const basepath = `${req.protocol}://${req.get('host')}/public/uploads`
    const product = new Products({
        name:req.body.name,
        image:`${basepath}${fileName}`,
        countInstock:req.body.countInstock,
        category:req.body.category,
        price:req.body.price,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        description:req.body.description,
        richDescription:req.body.richDescription,
        brand:req.body.brand,
        isFeature:req.body.isFeature,
    })
    product = await product.save()
    if(product){
        return res.status(200).json({success:true,message:'Product is created successfully'})
    }else{
        return res.status(400).json({success:false,message:'Product can not be created'})
    } 
    
})

router.put('/:id',async(req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(500).json({success:true},{message:'not valid product'})
    }

    const cat = await Category.findById(req.body.category)
    if(!cat) res.status(500).json({success:true},{message:'can not find category'})

    let product = await Products.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            image:req.body.image,
            countInstock:req.body.countInstock,
            category:req.body.category,
            price:req.body.price,
            rating:req.body.rating,
            numReviews:req.body.numReviews,
            description:req.body.description,
            richDescription:req.body.richDescription,
            brand:req.body.brand,
            isFeature:req.body.isFeature,
        },
        {
            new:true
        }
    )
    if(product){
        return res.status(200).json({success:true,message:'product find successfully'})
    }else{
        return res.status(400).json({success:false,message:'product not found'})
    } 
})


router.delete('/:id',(req,res)=>{

    Products.findByIdAndRemove(req.params.id).then(pdt=>{
       if(pdt){
           return res.status(200).json({success:true,message:'category deleted'})
       }else{
           return res.status(404).json({success:true,message:'category not found'})
       }
    }).catch(err=>{
       return res.status(400).json({success:false,error:err})
    })
})

router.get('/get/count',async (req,res)=>{
    const productCount = await Products.countDocuments((count)=>count)
    if(!productCount){
        res.status(500).json({success:false})
    }
    res.status(200).json(productCount)
})

router.get('/get/featured',async (req,res)=>{
    const products = await Products.find({isFeature:true})
    if(!products){
        res.status(500).json({success:false})
    }
    res.status(200).send(products)
})

router.get('/get/featured/:count',async (req,res)=>{
    const count = req.params.count ? req.params.count : 0
    const products = await Products.find({isFeature:true}).limit(+count)
    if(!products){
        res.status(500).json({success:false})
    }
    res.status(200).send(products)
})

router.put(`/gallery_images/:id`,uploadoptions.array('images'),async (req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(500).json({success:true},{message:'not valid product'})
    }


    const imgspath = []
    const file = req.files
    if(!file) {
        res.status(500).json({success:true},{message:'image file not uploaded'})
    }else{
        imgspath.push(`${basepath}${fileName}`)
    }

    
    const fileName = req.file.filename
    const basepath = `${req.protocol}://${req.get('host')}/public/uploads`

    const product = new Products.findByIdAndUpdate(req.params.id,{
       
        images:imgspath,
        
    })
    
    if(product){
        return res.status(200).json({success:true,message:'Product is created successfully'})
    }else{
        return res.status(400).json({success:false,message:'Product can not be created'})
    } 
    
})

module.exports = router