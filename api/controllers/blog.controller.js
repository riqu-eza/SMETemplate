import { getModels } from "../Models/index.js";

export const createBlog = async (req, res, next) => {
  console.log(req.body);
  try {
    // Get tenant-specific models using the connection attached to req (e.g., req.db)
    const models = getModels(req.db);
    const blogEntry = await models.Blog.create(req.body);
    console.log("saved", blogEntry);
    return res.status(200).json(blogEntry);
  } catch (e) {
    next(e);
  }
};

export const getBlog = async (req, res, next) => {
  console.log("we are here");
  try {
    const models = getModels(req.db);
    const blogEntries = await models.Blog.find();
    console.log("fetched", blogEntries);
    return res.status(200).json(blogEntries);
  } catch (e) {
    next(e);
  }
};
