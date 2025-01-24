import blog from "../Models/blog.model.js";

export const createblog = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await blog.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

export const getblog = async (req, res, next) => {
  console.log("we are here");
  try {
    const listing = await blog.find();
    res.status(200).json(listing);
    console.log("rty",listing)

  } catch (e) {
    next(e);
  }
};
