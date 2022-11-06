const mongoose = require("mongoose")
const cities = require("./cities")
const {descriptors, places} = require("./seedHelpers")
const Campground = require("../models/campground")

mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", ()=>{
    console.log("DB CONNECTED")
})


const sample = arr => arr[Math.floor(Math.random()*arr.length)]

const seedDB = async()=>{
    await Campground.deleteMany({})

    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random()*20)+10
        const camp = new Campground({
            author: "6361818b55251b97f0dc1f92",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus dolores illum animi, vero aliquid sunt similique minus fugit eos sequi, iusto quam asperiores laboriosam eius aspernatur laborum deserunt? Aperiam, cum?",
            price,
            geometry:{
              type: "Point",
              coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/da9pmrlsx/image/upload/v1667484750/YelpCamp/ehvepmsov9kvhwjjrur0.webp',
                  name: 'YelpCamp/ehvepmsov9kvhwjjrur0',

                },
                {
                  url: 'https://res.cloudinary.com/da9pmrlsx/image/upload/v1667484750/YelpCamp/szuynapekx59lykgomn0.jpg',
                  name: 'YelpCamp/szuynapekx59lykgomn0',

                }
              ]
        })
        await camp.save()
    }
    console.log("finished")
}

seedDB().then(()=>{
    mongoose.connection.close()
})

