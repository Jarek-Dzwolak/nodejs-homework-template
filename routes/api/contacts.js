const express = require("express");
const Joi = require("joi");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const contactsPath = path.join(__dirname, "contacts.json");

const readContactsFile = async () => {
  const data = await fs.readFile(contactsPath, "utf8");
  return JSON.parse(data);
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await readContactsFile();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

const validateContact = (contact) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(contact);
};

router.post("/", async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const contacts = await readContactsFile();
    const newContact = { ...req.body, id: uuidv4() };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const contacts = await readContactsFile();
    const contactIndex = contacts.findIndex(
      (contact) => contact.id === req.params.contactId
    );
    if (contactIndex !== -1) {
      contacts[contactIndex] = { ...contacts[contactIndex], ...req.body };
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
      res.json(contacts[contactIndex]);
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contacts = await readContactsFile();
    const updatedContacts = contacts.filter(
      (contact) => contact.id !== req.params.contactId
    );
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contacts = await readContactsFile();
    const updatedContacts = contacts.filter(
      (contact) => contact.id !== req.params.contactId
    );
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
