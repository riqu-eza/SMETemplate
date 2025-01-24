import Newsletter from "../Models/newsletter.model.js";

export const CreateNewsletter = async(req,res,next) =>{

    console.log(req.body);
    try{
        const newletter = await Newsletter.create(req.body);
        console.log("saved", newletter)
        return res.status(200).json(newletter);
    }catch(e){
        next(e)
    };
};