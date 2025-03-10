export const CreateNewsletter = async (req, res, next) => {
    // Get the tenant-specific Newsletter model from req.models
    const { Newsletter } = req.models;
  
    console.log(req.body);
    try {
      // Create a new newsletter entry using the tenant-specific Newsletter model
      const newsletter = await Newsletter.create(req.body);
      console.log("saved", newsletter);
  
      return res.status(200).json(newsletter);
    } catch (e) {
      next(e);
    }
  };
  
  export const getNewsletter = async (req, res, next) => {
    // Get the tenant-specific Newsletter model from req.models
    const { Newsletter } = req.models;
  
    try {
      // Fetch all newsletters from the tenant-specific model
      const newsletters = await Newsletter.find();
      
      if (!newsletters.length) {
        return res.status(404).json({ message: "No newsletters found" });
      }
  
      res.status(200).json(newsletters);
    } catch (error) {
      next(error);
    }
  };
  
  export const updateNewsletter = async (req, res, next) => {
    // Get the tenant-specific Newsletter model from req.models
    const { Newsletter } = req.models;
  
    try {
      const updatedNewsletter = await Newsletter.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
  
      if (!updatedNewsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
  
      res.json(updatedNewsletter);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  export const deleteNewsletter = async (req, res, next) => {
    // Get the tenant-specific Newsletter model from req.models
    const { Newsletter } = req.models;
  
    try {
      const deletedNewsletter = await Newsletter.findByIdAndDelete(req.params.id);
  
      if (!deletedNewsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
  
      res.json({ message: "Newsletter deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  