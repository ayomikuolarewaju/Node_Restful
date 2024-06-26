const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get(`/:id`, async (req, res) =>{
    const user = await User.find(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({success: false})
    } 
    res.send(user);
})

router.post('/login',async(req,res)=>{
    const user = new User.findOne({email:req.body.email})

    if(!user){
         res.status(500).json({success:false,message:'You are not register'})
    }
    
    if(user && bcrypt.compareSync(req.body.passwordHash,user.password)){
        const secret = process.env.secret
        const token = jwt.sign({userId:user.id,isAdmin:user.isAdmin},secret,{expiresIn:'1d'})
        res.status(200).json({success:true,user: user.email,token:token})
    }else{
        res.status(200).json({success:true,message:'You are not a user'})
    }

})


router.post('/',async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save()
    
    if(!user){
        return res.status(500).json({success:false,message:'User not register'})
    }else{
        return res.status(200).json({success:true,message:'User register'})
    }
})

router.get('/get/count',async (req,res)=>{
    const userCount = await User.countDocuments((count)=>count)
    if(!userCount){
        res.status(500).json({success:false})
    }
    res.status(200).json(userCount)
})

router.delete('/:id',(req,res)=>{

    User.findByIdAndRemove(req.params.id).then(user=>{
       if(user){
           return res.status(200).json({success:true,message:'user deleted'})
       }else{
           return res.status(404).json({success:true,message:'use not found'})
       }
    }).catch(err=>{
       return res.status(400).json({success:false,error:err})
    })
})

module.exports = router;