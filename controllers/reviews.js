const Review = require("../models/review")
const Campground = require("../models/campground")

module.exports.createReview = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    const r = new Review(req.body.review)
    r.author = req.user._id
    c.reviews.push(r)
    await r.save()
    await c.save()
    req.flash("success", "You successfully ADDED a review!")
    res.redirect(`/campgrounds/${id}`)
}
module.exports.deleteReview = async(req,res)=>{
    const {id, revId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull: {reviews: revId}})
    await Review.findByIdAndDelete(revId)
    req.flash("success", "Review successfully deleted!")
    res.redirect(`/campgrounds/${id}`)
}