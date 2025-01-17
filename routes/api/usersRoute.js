const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../../services/users");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const multer = require("multer");
const gravatar = require("gravatar");
const auth = require("../../auth");
const { getUser } = require("../../models/users");
const path = require("path");
const jimp = require("jimp");

const Mailer = require("../../mailer");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ////////////////////////////////////////

router.post("/signup", async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error" });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const avatarURL = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
    console.log("Generated avatarURL:", avatarURL);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      subscription: "starter",
      avatarURL: avatarURL,
    });

    const verificationToken = Mailer.generateVerificationToken();
    user.verificationToken = verificationToken;

    await user.save();

    await Mailer.sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
        verificationToken: user.verificationToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ///////////////////////////////////////////
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    
    if (!user.verify) {
      return res.status(401).json({ message: "Account not verified" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// /////////////////////////////////////////////////////

router.post("/logout", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await getUser(userId);

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
      });
    }

    user.token = null;
    await user.save();

    res.status(200).json({
      message: "Logout is done",
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred during logout.",
    });
  }
});

// //////////////////////////////////////////////

router.get("/current", auth, async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// //////////////////////////////////////////

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), (req, res) => {
  const { description } = req.body;
  res.json({
    description,
    message: "Plik załadowany pomyślnie",
    status: 200,
  });
});

// ////////////////////////////////////////////

router.patch("/avatars", auth, upload.single("avatar"), async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const avatarData = req.file.path;
    console.log(req.file);
    if (!avatarData || avatarData.length === 0) {
      return res.status(400).json({ message: "Invalid avatar data" });
    }

    const uniqueFileName = `${currentUser._id}${path.extname(
      req.file.originalname
    )}`;

    const tmpPath = path.join(__dirname, "../../tmp", uniqueFileName);

    const image = await jimp.read(avatarData);
    await image.resize(250, 250).writeAsync(tmpPath);

    console.log("Avatar resized successfully");

    const finalPath = path.join(
      __dirname,
      "../../public/avatars",
      uniqueFileName
    );

    await jimp.read(tmpPath);
    await image.writeAsync(finalPath);

    console.log("Avatar saved successfully");

    currentUser.avatarURL = `/avatars/${uniqueFileName}`;
    await currentUser.save();

    res.status(200).json({ avatarURL: currentUser.avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error 2" });
  }
});

// ///////////////////////////////////////////////////////////////////////

router.get("/verify/:verificationToken", async (req, res) => {
  try {
    const verificationToken = req.params.verificationToken;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;

    await user.save();

    user.verificationToken = null;

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// /////////////////////////////////////////////////////////

router.post("/verify", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = Mailer.generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    await Mailer.sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
