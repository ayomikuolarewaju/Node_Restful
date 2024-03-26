const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:''
        
    },
    countInstock:{
         type: Number,
         required:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
   },
   price:{
    type: Number,
    default:0,
    min:0,
    max:255
},
 rating:{
    type: Number,
    default:0
},
numReviews:{
    type: Number,
    default:0
},
description:{
    type: String,
},
richDescription:{
    type: Number,
    default:''
},
images :[{
    type: Array,
}],
brand:{
    type: String
},
isFeature:{
    type: Boolean,
    default:false
},
dateCreated:{
    type: Date,
    default:Date.now
},
})


productSchema.virtual('id').get(()=>{
    return this._id.toHexString()
})

productSchema.set('Json',{virtual:true})



exports.Products = mongoose.model('Eshop_Product', productSchema)