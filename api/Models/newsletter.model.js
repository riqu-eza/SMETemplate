import mongoose from "mongoose";

const {Schema} = mongoose;

const NewsletterSchema = new Schema({
    email:{
        type:String,
        required:true,
    }
},{timestamps:true}
);

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);

export default Newsletter;