require('dotenv').config();
const express = require('express');
const date = require(__dirname + "/date.js");
// console.log(date()); // logs the exports

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// for the backend database
const mongoose = require("mongoose");
const link = "mongodb+srv://admin-malcolm:" + process.env.SECRET + "@cluster0.wbcir.mongodb.net/todolistDB";
mongoose.connect(link, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// lodash
const _ = require("lodash");

// create the schema
const itemsSchema = new mongoose.Schema({
    itemName: String
});

// create model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    itemName: "Welcome to your todolist"
});

const item2 = new Item({
    itemName: "Hit the + button to add more tasks"
});

const item3 = new Item({
    itemName: "<-- Press this to delete the item"
});

const defaultItems = [item1, item2, item3];

// create schema for custom lists
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
    // let day = date.getDate();
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added the first few items");
                }
            });
            res.redirect("/");
        } else {
            res.render('list', {ejsTitle: "Today", ejsItems: foundItems});
        }
    });
});

// set express routing parameters
app.get("/:customListTitle", (req, res) => {
    const customListTitle = _.capitalize(req.params.customListTitle);

    List.findOne({name: customListTitle}, function(err, foundTitle) {
        if (!err) {
            // foundTitle is the entire object
            if (!foundTitle) {
                // create new list
                const list = new List({
                    name: customListTitle,
                    items: defaultItems
                });
                list.save(function() {
                    console.log("redirecting to " + customListTitle);
                    res.redirect("/" + customListTitle);
                });
            } else {
                // display the site
                res.render('list', {ejsTitle: customListTitle, ejsItems: foundTitle.items});
            }
        }
    });
});

app.post("/", (req, res) => {
    const title = req.body.title;
    const item = req.body.newItem;

    const itemAdded = new Item({
        itemName: item
    });

    // check the title of the page to know which list to add to
    if (title === "Today") {
        itemAdded.save();
        res.redirect("/");
    } else {
        List.findOne({name: title}, function(err, foundTitle) {
            foundTitle.items.push(itemAdded);
            foundTitle.save();
            res.redirect("/" + title);
        });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const title = req.body.listTitle;

    if (title === "Today") {

        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Removed item from list");
                res.redirect("/");
            }
        });
    } else {
        // need to remove an item from the array
        List.findOneAndUpdate({name: title}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
            if (!err) {
                res.redirect("/" + title);
            }
        });
    }
});

app.listen(port, () => {
    console.log("Server started on port " + port);
});
