const express = require("express");
const router = express.Router();
const axios = require("axios");
const Stock = require("../model/Stock");

/* check the API call from Finnhub */
router.get("/analyze", async (req, res) => {
  const symbol = req.query.symbol;
  const key = process.env.API_KEY;

  if (!symbol) {
      return res.render("index", { error: "Please enter a symbol." });
  }

  try {
      /* retrieve data */
      const [quote, profile] = await Promise.all([
          axios.get("https://finnhub.io/api/v1/quote", {
              params: { symbol: symbol.toUpperCase(), token: key }
          }),
          axios.get("https://finnhub.io/api/v1/stock/profile2", {
              params: { symbol: symbol.toUpperCase(), token: key }
          })
      ]);

      const priceData = quote.data;
      const profileData = profile.data;

      /* check if Finnhub returned empty data */
      if (Object.keys(profileData).length === 0 || priceData.c === 0) {
          return res.render("index", { error: "Invalid Search: Stock not found." });
      }

      res.render("analysis", { 
          symbol: symbol.toUpperCase(),
          price: priceData,
          profile: profileData
      });

  } catch (err) {
      console.error(err);
      res.render("index", { error: "System Error: Could not connect to API." });
  }
});

/* get all stocks for the watchlist */
router.get("/watchlist", async (req, res) => {
   try {
      const songs = await Stock.find({}).sort({ addedAt: -1 });
      res.render("watchlist", { stocks: songs });
   } catch (err) {
      console.error(err);
   }
});

/* post a stock to the database */
router.post("/processSave", async (req, res) => {
   let {symbol, companyName, price} = req.body;
   
   try {
      const existing = await Stock.findOne({ symbol: symbol });

      if (!existing) {
          await Stock.create({
             symbol: symbol,
             companyName: companyName,
             price: Number(price)
          });
      }

      const songs = await Stock.find({}).sort({ addedAt: -1 });
      res.render("watchlist", { stocks: songs });
   } catch (err) {
      console.error(err);
   }
});

/* remove a single stock */
router.post("/processRemove", async (req, res) => {
   try {
      await Stock.deleteOne({ symbol: req.body.symbol });
      
      const songs = await Stock.find({}).sort({ addedAt: -1 });
      res.render("watchlist", { stocks: songs });
   } catch (err) {
      console.error(err);
   }
});

/* Clearing the entire collection */
router.post("/processClear", async (req, res) => {
   try {
      await Stock.deleteMany({});
      res.render("watchlist", { stocks: [] });
   } catch (err) {
      console.error(err);
   }
});

module.exports = router;