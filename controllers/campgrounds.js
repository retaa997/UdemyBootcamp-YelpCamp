const Campground = require("../models/campground")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
const {cloudinary} = require("../cloudinary")

module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
}
module.exports.createCampground = async(req,res, next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const c = new Campground(req.body.campground)
    c.geometry = geoData.body.features[0].geometry
    c.images = req.files.map(f => ({url: f.path, name: f.filename}))
    c.author = req.user._id
    await c.save()
    req.flash("success", "Successfully ADDED a new campground!")
    res.redirect(`/campgrounds/${c._id}`)
}
module.exports.renderNewForm = async(req,res)=>{
    
    res.render("campgrounds/new")
}
module.exports.showCampground = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author"
        }
    })
    .populate("author")
    if(!c){
        req.flash("error", "Campground not find!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {c})
}
module.exports.editCampground = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true})
    req.flash("success", "You successfully EDITED a Campground!")
    res.redirect(`/campgrounds/${c._id}`)
}
module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findByIdAndDelete(id)
    req.flash("deleted", "You DELETED a Campground!")
    res.redirect(`/campgrounds`)
}
module.exports.renderEditForm = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    if(!c){
        req.flash("error", "Can not find Camp!")
        return res.redirect(`/campgrounds`)
    }
    res.render("campgrounds/edit", {c})
}

module.exports.renderManageImages = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    if(!c){
        req.flash("error", "Can not find Camp!")
        return res.redirect(`/campgrounds`)
    }
    res.render("campgrounds/manageImages", {c})
}

module.exports.manageImages = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    const imgs = req.files.map(f => ({url: f.path, name: f.filename}))
    c.images.push(...imgs)
    await c.save()
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteImages = async(req,res)=>{
    const {id} = req.params
    const c = await Campground.findById(id)
    if(req.body.deleteImages){
        for(let name of req.body.deleteImages){
            await cloudinary.uploader.destroy(name)
        }
        await c.updateOne({$pull: {images: {name: {$in: req.body.deleteImages}}}})
    }
    res.redirect(`/campgrounds/${id}/manageImages`)
    
}