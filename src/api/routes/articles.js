const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bc", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Articles conectado");
});

const articlesSchema = new mongoose.Schema({
  kb_id: String,
  kb_title: String,
  kb_body: String,
  kb_permalink: String,
  kb_keywords: String,
  kb_liked_count: Number,
  kb_published: Boolean,
  kb_suggestion: Boolean,
  kb_featured: Boolean,
  kb_author_email: String,
  kb_published_date: { type: Date, default: Date.now },
});

const Article = mongoose.model("Article", articlesSchema);

router.get("/", async (req, res) => {
  try {
    const foundArticles = await Article.find();
    res.status(200).json(foundArticles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const article = req.body.article;
  try {
    const newArticle = await Article.create(article);
    res.json({ message: "Artigo salvo com sucesso!", newArticle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const articleId = req.params.id;
  const updatedArticle = req.body.article;
  try {
    const result = await Article.findByIdAndUpdate(
      articleId,
      {
        $set: updatedArticle,
      },
      { new: true }
    );
    res.json({ message: "Artigo atualizado com sucesso!", updatedArticle: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Artigo não encontrado" });
    }

    return res.json({ message: "Artigo excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;