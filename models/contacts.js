const Contact = require("../services/contacts");

const listContacts = async (userId) => {
  try {
    return await Contact.find({ owner: userId });
  } catch (err) {
    console.log("Error getting contact list: ", err);
    throw err;
  }
};

const getContactById = async (contactId) => {
  try {
    return await Contact.findOne({ _id: contactId, owner: userId });
  } catch (err) {
    console.log(`Error getting contact with id ${contactId}: `, err);
    throw err;
  }
};

const removeContact = async (contactId) => {
  try {
    return await Contact.findByIdAndRemove({ _id: contactId });
  } catch (err) {
    console.log(`Error removing contact with id ${contactId}: `, err);
    throw err;
  }
};

const addContact = async (userId, body) => {
  try {
    const contactData = { ...body, owner: userId };
    return await Contact.create(contactData);
  } catch (err) {
    console.log("Error adding new contact: ", err);
    throw err;
  }
};

const updateContact = async (contactId, body) => {
  try {
    return await Contact.findByIdAndUpdate({ _id: contactId }, body, {
      new: true,
    });
  } catch (err) {
    console.error("An error occurred while updating contact: ", err);
    throw err;
  }
};

const updatedStatusContact = async (contactId, favorite) => {
  try {
    return await Contact.findByIdAndUpdate(
      { _id: contactId },
      { $set: { favorite: favorite } },
      { new: true }
    );
  } catch (err) {
    console.error("An error occurred while updating contact: ", err);
    throw err;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updatedStatusContact,
};
