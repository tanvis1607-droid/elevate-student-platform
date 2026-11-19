import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const makeToken = id => jwt.sign({ id }, process.env.JWT_SECRET || "development_only_change_me", { expiresIn: "7d" });
const safeUser = user => ({ id: user._id, name: user.name, email: user.email });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6)
      return res.status(400).json({ message: "Enter your name, a valid email, and a password of at least 6 characters." });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: safeUser(user) });
  } catch (e) { next(e); }
});
export default router;
