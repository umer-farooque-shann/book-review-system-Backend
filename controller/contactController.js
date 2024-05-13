import Contact from "../models/Contact.js";

// Controller to handle creating a new contact entry
export const createContact = async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to handle fetching all contact entries
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteContactById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const contact = await Contact.findByIdAndDelete(id);
  
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
  
      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };