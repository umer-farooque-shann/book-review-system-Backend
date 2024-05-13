import Request from "../models/Request.js";
// Controller to handle creating a new request
export const createRequest = async (req, res) => {
  const id = req.user.id; // Assuming user ID is stored in _id field of the user object
  const { requestDetails } = req.body;

  try {
    const newRequest = new Request({
      user: id, // Associate the request with the authenticated user's ID
      requestDetails
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

// Controller to get all requests for the authenticated user
export const getAllRequests = async (req, res) => {
  const { _id } = req.user; // Assuming user ID is stored in _id field of the user object
  try {
    const requests = await Request.find({ user: _id }).populate('user', 'username'); // Populate user field with username only
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};
