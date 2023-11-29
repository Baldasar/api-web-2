const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs/promises");

router.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bc", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Articles conectado");
});

const articlesSchema = new mongoose.Schema({
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

router.post("/:id/like", async (req, res) => {
  const articleId = req.params.id;

  try {
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ error: "Article not found." });
    }

    article.kb_liked_count = (article.kb_liked_count || 0) + 1;

    const updatedArticle = await article.save();

    res.json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const newArticle = req.body;

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      pid,
      {
        kb_title: newArticle.kb_title,
        kb_body: newArticle.kb_body,
        kb_permalink: newArticle.kb_permalink,
        kb_keywords: newArticle.kb_keywords,
        kb_published: newArticle.kb_published,
        kb_suggestion: newArticle.kb_suggestion,
        kb_featured: newArticle.kb_featured,
        kb_author_email: newArticle.kb_author_email,
      },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found." });
    }

    res.json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

const populateArticlesFromJson = async () => {
  try {
    const jsonData = await fs.readFile("src/api/data/articles.json", "utf8");
    const articlesData = JSON.parse(jsonData);

    if (Array.isArray(articlesData) && articlesData.length > 0) {
      await Article.insertMany(articlesData);
      console.log("Base de artigos populada");
    } else {
      console.log("Nenhum Artigo encontrado no arquivo JSON");
    }
  } catch (err) {
    console.error("Erro ao popular Artigos:", err.message);
  }
};

const checkDatabase = async () => {
  try {
    const articlesCount = await Article.countDocuments();

    if (articlesCount === 0) {
      await populateArticlesFromJson();
    }
  } catch (err) {
    console.error("Error checking database:", err.message);
  }
};

checkDatabase();

module.exports = router;
