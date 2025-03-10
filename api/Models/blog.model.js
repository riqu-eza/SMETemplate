import mongoose from "mongoose";


const BlogSchema = new mongoose.Schema({
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


export default BlogSchema;

