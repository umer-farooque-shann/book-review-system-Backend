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

export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('user', 'name email'); // Populate user field with name and email fields
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

