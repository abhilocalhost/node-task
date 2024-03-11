const mongoose = require('mongoose')



const Book = mongoose.model('Book',{
    name:{
        required:true,
        type: String,
        trim:true
    },
    author:{
        required:true,
        type: String,
        trim:true
    },
    genre:{
        required:true,
        type: String,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref :'User'
    }
})


module.exports = Book