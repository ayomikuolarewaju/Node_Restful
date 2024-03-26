const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.send(categoryList);
})

router.get('/:id',async(req,res)=>{

    let cat = await Category.findById(req.params.id)
    if(cat){
        return res.status(200).json({success:true,message:'cat find successfully'})
    }else{
        return res.status(400).json({success:false,message:'cat not found'})
    } 
})

router.put('/:id',async(req,res)=>{
    let cat = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {
            new:true
        }
    )
    if(cat){
        return res.status(200).json({success:true,message:'cat find successfully'})
    }else{
        return res.status(400).json({success:false,message:'cat not found'})
    } 
})

router.post('/',async (req,res)=>{
    let cat = new Category({
        name : req.body.name,
        icon: req.body.icon,
        color:req.body.color,
        image:req.body.image
    })
    cat = await cat.save()
    
    if(!cat) {
        res.status(500).json({success: false})
    } 
    res.send(cat);
})

router.delete('/:id',(req,res)=>{
     Category.findByIdAndRemove(req.params.id).then(cat=>{
        if(cat){
            return res.status(200).json({success:true,message:'category deleted'})
        }else{
            return res.status(404).json({success:true,message:'category not found'})
        }
     }).catch(err=>{
        return res.status(400).json({success:false,error:err})
     })
})

module.exports = router;