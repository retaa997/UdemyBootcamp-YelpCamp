const express = require("express")
const router = express.Router({mergeParams: true})

const reviews = require("../controllers/reviews")
const Review = require("../models/review")
const Campground = require("../models/campground")
const catchAsync = require("../utils/catchAsync")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware")





router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete("/:revId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router