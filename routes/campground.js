const express = require("express")
const router = express.Router({mergeParams: true})
const {storage} = require("../cloudinary")

const multer  = require('multer')
const upload = multer({storage})

const campgrounds = require("../controllers/campgrounds")
const Campground = require("../models/campground")
const catchAsync = require("../utils/catchAsync")

const {isLoggedIn, validateCampground, isAuthor} = require("../middleware")


router.route("/")
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))   
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) 

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
router.route("/:id/manageImages")
    .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderManageImages))
    .put(isLoggedIn, isAuthor, upload.array("image"), catchAsync(campgrounds.manageImages))
    .delete(isLoggedIn, isAuthor, upload.array("image"), catchAsync(campgrounds.deleteImages))
    


module.exports = router