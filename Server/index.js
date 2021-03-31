const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const con = mysql.createConnection({
  host: "192.168.86.244",
  database: "Mat",
  user: "Henke",
  password: "00300030",
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/ny-vecka", (req, res) => {
  con.query(
    "SELECT distinct(tblFood.cName), id, cVikt from tblFood where cVikt > 4 ORDER BY -LOG(1.0 - RAND()) / cVikt limit 14",
    function (error, results, fields) {
      if (error) throw error;
      res.send(JSON.stringify(results));
      //console.log(results);
    }
  );
});

app.get("/get-food-info:id", (req, res) => {
  const { id } = req.params;

  con.query(
    "SELECT tblFood.cName, tblFood.cInfo, tblVaror.cV_Name, tblRecipes.cAmount, tblVaror.cV_Amount, tblRecipes.cAmountType, tblVaror.cV_Id, tblRecipes.id from tblFood left join tblRecipes on tblFood.Id = tblRecipes.refFoodId left join tblVaror on tblRecipes.refFridgeId = tblVaror.cV_Id where tblFood.id=" +
      id +
      "",
    function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.send(JSON.stringify(results));
    }
  );
});

app.get("/getweeks", (req, res) => {
  con.query(
    "(SELECT tblFood.id, tblFood.cName, tblWeek.cDay from tblWeek inner join tblFood on tblFood.Id = tblWeek.cMat order by tblWeek.id desc limit 14) order by Id",
    function (error, results) {
      if (error) throw error;
      res.send(JSON.stringify(results));
      //console.log(results);
    }
  );
});

app.get("/dag:id", (req, res) => {
  const { id } = req.params;
  con.query(
    "SELECT tblFood.cName, id, cVikt from tblFood where cVikt > 4 and id not in (" +
      id +
      ") ORDER BY -LOG(1.0 - RAND()) / cVikt limit 1",
    function (error, results, fields) {
      if (error) throw error;
      res.send(JSON.stringify(results));
      //console.log(results);
    }
  );
});

app.get("/ac:search", (req, res) => {
  const { search } = req.params;
  console.log(search);
  con.query(
    "select cV_Name, cV_Id from tblVaror where cV_Name Like '" + search + "%'",
    function (error, results) {
      if (error) throw error;
      console.log(results);
      res.send(JSON.stringify(results));
    }
  );
});

app.post("/spara-vecka", (req, res) => {
  var array = req.body;
  var arrHandla = [];
  let ids = "0";
  let passed = false;
  for (let i = 0; i < array.length; i++) {
    ids = ids + ", " + array[i][0];
  }

  con.query(
    "SELECT tblVaror.cV_Name, tblRecipes.cAmount, tblVaror.cV_AmountType, tblVaror.cV_Id from tblFood left join tblRecipes on tblFood.Id = tblRecipes.refFoodId left join tblVaror on tblRecipes.refFridgeId = tblVaror.cV_id where tblFood.id in (" +
      ids +
      ")",
    function (error, results) {
      if (error) throw error;

      results.forEach(function (results) {
        for (let i2 = 0; i2 < arrHandla.length; i2++) {
          if (arrHandla[i2][0] == results.cV_Name) {
            arrHandla[i2][1] += Math.ceil(results.cAmount);
            passed = true;
          }
        }

        if (!passed) {
          arrHandla.push([
            results.cV_Name,
            results.cAmount,
            results.cV_AmountType,
            results.cV_Id,
          ]);
        }
        passed = false;
      });
      console.log("Före: ", arrHandla);
    }
  );

  con.query("Select cF_Ref, cF_Amount from tblFridge", function (
    error,
    results
  ) {
    if (error) throw error;

    results.forEach(function (results) {
      //console.log(results.cF_Ref);
      for (let i2 = 0; i2 < arrHandla.length - 1; i2++) {
        if (arrHandla[i2][3] == results.cF_Ref) {
          if (arrHandla[i2][1] - results.cF_Amount <= 0) {
            arrHandla.splice(i2, 1);
          } else {
            arrHandla[i2][1] = arrHandla[i2][1] - results.cF_Amount;
          }
        }
      }
    });
    console.log("Efter: ", arrHandla);
  });

  // con.query("INSERT INTO tblWeek (cMat, cDay) VALUES ?", [array], function (
  //   error,
  //   results,
  //   fields
  // ) {
  //   if (error) throw error;
  //   send = send + "\n" + results;
  // });
  // res.sendStatus(200);
  // res.send(send);
});

app.post("/saveIngredients", (req, res) => {
  // console.log(req.body);
  // const sendData = [("id", "1")];
  // res.send(sendData);

  if (req.body[3] == "1") {
    console.log("Japp");
  } else {
    console.log("Nopp");
  }
});

app.listen(303, function (err) {
  if (err) console.log(err);
  console.log("Example app listening on port 303!");
});
