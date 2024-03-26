const mongoose = require('mongoose');

const orderItemsSchema = mongoose.Schema({
    quantities:{
     type:Number,
     required:true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required:true
    }],
    
})

orderItemsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderItemsSchema.set('toJSON', {
    virtuals: true,
});

exports.OrderItems = mongoose.model('OrderItems', orderItemsSchema);