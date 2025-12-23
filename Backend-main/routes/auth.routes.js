const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/auth.controller");
const { requestPasswordReset, resetPassword } = require("../controllers/passwordReset.controller");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
