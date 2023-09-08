const express = require("express");
const auth = require("../../auth");

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updatedStatusContact,
} = require("../../models/contacts");
const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const contacts = await listContacts(userId);

    return res.json({
      status: "success",
      code: 200,
      data: { contacts },
    });
  } catch (err) {
    res
      .status(500)
      .json(`An error occurred while getting the contact list: ${err}`);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  try {
    const contact = await getContactById(userId, id);

    if (!contact) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      data: { contact },
    });
  } catch (err) {
    res.status(500).json(`An error occurred while getting the contact: ${err}`);
  }
});

router.post("/", auth, async (req, res, next) => {
  const { body, user } = req;

  if (Object.keys(body).length === 0) {
    return res
      .status(400)
      .json("Error! Missing fields! Empty request is not allowed");
  }

  try {
    const contact = await addContact(user.id, body);

    return res.status(201).json({
      status: "success",
      code: 201,
      data: { contact },
    });
  } catch (err) {
    res.status(500).json(`An error occurred while adding the contact: ${err}`);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const isContactRemoved = await removeContact(id);

    return res.status(200).json({
      message: `Contact with ID ${id} has been successfully removed.`,
      data: { isContactRemoved },
    });
  } catch (err) {
    res
      .status(500)
      .json(`An error occurred while removing the contact: ${err}`);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { body } = req;

  if (Object.keys(body).length === 0) {
    return res
      .status(400)
      .json("Error! Missing fields! Empty request is not allowed");
  }

  try {
    const updatedContact = await updateContact(id, body);

    return res.json({
      status: "success",
      code: 200,
      data: { updatedContact },
    });
  } catch (err) {
    res
      .status(500)
      .json(`An error occurred while updating the contact: ${err}`);
  }
});

router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { body } = req;
  const { favorite } = body;

  if (!("favorite" in body) || Object.keys(body).length === 0) {
    return res.status(400).json("Error! Missing field favorite!");
  }

  try {
    const updatedStatus = await updatedStatusContact(id, favorite);

    return res.json({
      status: "success",
      code: 200,
      data: { updatedStatus },
    });
  } catch (err) {
    res
      .status(500)
      .json(`An error occurred while updating the contact: ${err}`);
  }
});
module.exports = router;
