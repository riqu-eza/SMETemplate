import mongoose from "mongoose";

const { Schema  } = mongoose;

const blogschema = new Schema({
    title:{
        type:String,
        required: true
    },
    content:{
        type:String,
        required: true
    },
    imageUrls:{
        type:[String],
        required: true
    }
},
{timestamps: true});

const blog = mongoose.model('blog',blogschema)

export default blog;

