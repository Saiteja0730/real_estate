import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";


export const createListing = async (req, res, next) => {
    try {
      console.log('=== Incoming Request ===');
      console.log('Headers:', req.headers);
      console.log('Request Body:', req.body);
      console.log('User from Token (req.user):', req.user); // If using JWT
  
      if (!req.body.userRef) {
        console.error('Missing userRef in request body');
        return next(errorHandler(400, "User reference is required"));
      }
      
  
      const listing = await Listing.create(req.body);
      console.log('Listing created:', listing);
  
      res.status(201).json({
        success: true,
        listing
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      next(error);
    }
  };

  export const deleteListing = async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      
      if (!listing) {
        return next(errorHandler(404, "Listing not found"));
      }
  
      if (req.user.id !== listing.userRef.toString()) {
        return next(errorHandler(401, "You can only delete your own listing"));
      }
  
      await listing.deleteOne();
      res.status(200).json({
        success: true,
        message: "Listing deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };


  export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (req.user.id !== listing.userRef.toString()) {
      return next(errorHandler(401, "You can only update your own listing"));
    }
    
    try {
     const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id ,
      req.body,
      {new: true} 
     );
     res.status(200).json({
      success: true,
      updatedListing
     })
    } catch (error) {
      console.error('Error updating listing:', error);
      next(error);
    }
  };  


  export const getListing = async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return next(errorHandler(404, "Listing not found"));
      }
      res.status(200).json({
        success: true,
        listing
      });
    } catch (error) {
      next(error);  
    }
  }

  export const getListings = async (req, res, next) => {
    try {
     
      const limit = parseInt(req.query.limit) || 9;
      const startIndex = parseInt(req.query.startIndex) || 0;
      
      let offer = req.query.offer; 

      if (offer === undefined || offer === 'false') {
        offer = { $in: [false, true]};
      }

      let furnished = req.query.furnished;
      if (furnished === undefined || furnished === 'false') {
        furnished = { $in: [false, true]};
      } 
      
      let parking = req.query.parking;
      if (parking === undefined || parking === 'false') {
        parking = { $in: [false, true]};
      } 

      let type = req.query.type;
      if (type === undefined || type === 'false') {
        type = { $in: [false, true]};
      } 

      const searchTerm = req.query.searchTerm || '';

      const sort = req.query.sort || 'createdAt';

      const order = req.query.order || 'desc';
      

      const listings = await Listing.find({
        name: { $regex: searchTerm, $options: 'i' },
        offer,
        furnished,
        parking,
        type,
      })
      .sort({[sort]: order})
      .limit(limit)
      .skip(startIndex);
      
      res.status(200).json({
        success: true,
        listings
      });
    } catch (error) {
      next(error);  
    }
  }