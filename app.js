

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating a new database and connecting it to url where mongodb is hosted locally
mongoose.connect("mongodb+srv://admin-manav:manav62628@cluster0.6v2i2.mongodb.net/todolistDB");



const itemsSchema = {
  name : String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "buy food"
})

const item2 = new Item({
  name: "cook food"
})

const item3 = new Item({
  name: "eat food"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);




// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
      
        }else{
          console.log("successfullyy updated");
        }
      });
        res.redirect("/");
      
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
      
    
    //console.log(foundItems);
  })
const day = date.getDate();
});


app.get("/:customListName", function(req,res){


  const customListName = req.params.customListName;
  

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("doesnt exist");
        //create new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        
        list.save();
        res.redirect("/"+customListName)

      }else{
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })



})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  

  const item = new Item({
    name: itemName

  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName} , function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);

    })
  }
    
  

  
});

app.post("/delete", function(req,res){
  console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("deleted successfully ");
        res.redirect("/")
      }
    })

  }else{
    List.findOneAndUpdate({name: listName}, {$pull : {items : {_id: checkedItemId}}}, function(err){
      if(!err){
        res.redirect("/"+listName);
      }
    })

  }
  
 
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
