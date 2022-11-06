const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")


const opts = {toJSON: {virtuals: true}}

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            name: String
        }
    ],
    geometry:{
        type:{
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

CampgroundSchema.virtual("properties.popUp").get(function (){
    const newUrl = `/campgrounds/${this._id}`
    return `<h6><a href=${newUrl}>${this.title}</a></h6>`
})

CampgroundSchema.post("findOneAndDelete", async function(doc){
    if(doc){
        for(let r of doc.reviews){
            await Review.findByIdAndDelete(r._id)
        }
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema)