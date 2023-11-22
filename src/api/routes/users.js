const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bc", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB conectado");
});

const usersSchema = new mongoose.Schema({
  author_name: String,
  author_email: String,
  author_user: String,
  author_pwd: String,
  author_level: String,
  author_status: Boolean,
  author_create_date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", usersSchema);

router.get("/", async (req, res) => {
  try {
    const foundedUser = await User.find();
    res.status(200).json(foundedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const user = req.body.user;
  try {
    const newUser = await User.create(user);
    res.json({ message: "Usuário salvo com sucesso!", newUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const newUser = req.body.user;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      pid,
      {
        author_name: newUser.author_name,
        author_email: newUser.author_email,
        author_pwd: newUser.author_pwd,
        author_level: newUser.author_level,
        author_status: newUser.author_status,
      },
      { new: true }
    );
    res.json({ message: "Usuário alterado com sucesso!", updatedUser });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const userId = req.params.pid;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    return res.json({ mensagem: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

router.post("/login", async (req, res) => {
  const { author_user, author_pwd } = req.body;

  try {
    const user = await User.findOne({ author_user });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    if (user.author_pwd !== author_pwd) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.status(200).json({ message: "Login bem-sucedido", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { author_user, author_pwd } = req.body;

  try {
    const user = await User.findOne({ author_user });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const isPasswordValid = await user.comparePassword(author_pwd);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.status(200).json({ message: "Login bem-sucedido", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
