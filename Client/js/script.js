const API_URL = "http://192.168.86.33:303/";
//--
let spik = [];
let dag;

let productId = "";
let recepieId = "";
let fieldToEdit = "";
//--
const selection = window.getSelection();
const range = document.createRange();
const div = document.querySelector(".dagar");
let acDiv = document.getElementById("acDiv");
const column1 = document.querySelector(".column1");
const elm = document.getElementsByClassName("mat");
const info = document.getElementById("info");
//--
const infoTxt = document.getElementById("info-desc");
const infoFridge = document.getElementById("info-fridge");
//--
const datalista = document.getElementById("datalista");
const vara = document.getElementById("vara");
const amount = document.getElementById("amount");
const type = document.getElementById("type");

const dagar = [
  ["Måndag", ""],
  ["Tisdag", ""],
  ["Onsdag", ""],
  ["Torsdag", ""],
  ["Fredag", ""],
  ["Lördag", ""],
  ["Söndag", ""],
];

function pushFoodInfo(id, mat, dag, mod = 1, dagnr, column, classType) {
  if (mod == 1) {
    const contents = document.createElement("section");
    const header = document.createElement("h2");
    const paragraph = document.createElement("h3");

    contents.classList.add(classType);
    contents.classList.add("--r-p-s");
    contents.classList.add("--r-m-xs");
    contents.id = "s" + id;
    header.className = "--s-mb-xxs";
    header.id = "h" + id;
    paragraph.id = "p" + id;

    header.textContent = dag;
    paragraph.textContent = mat;

    contents.appendChild(header);
    contents.appendChild(paragraph);

    if (dagnr == 0) {
      this[column] = document.createElement("div");
      this[column].className = column;
      div.appendChild(this[column]);
    }
    this[column].appendChild(contents);
  } else {
    const contents = document.getElementById("s" + dag);
    const header = document.getElementById("h" + dag);
    const paragraph = document.getElementById("p" + dag);

    contents.id = "s" + id;
    header.id = "h" + id;
    paragraph.id = "p" + id;

    for (var i = 0; i < spik.length; i++) {
      if (spik[i][0] == dag) {
        spik[i][0] = id;
      }
    }

    paragraph.innerText = mat;
  }
}

function pushIngredientsInfo(amount, type, name, id) {
  txtPrint = amount + " " + type + " " + name;

  const ingridient = document.createElement("div");
  const fieldAmount = document.createElement("span");
  const fieldType = document.createElement("span");
  const fieldName = document.createElement("span");

  ingridient.className = "ingridient";
  ingridient.id = "ingridient_" + id;

  fieldAmount.className = "ingredientEditeble";
  fieldAmount.id = "amount_" + id;
  fieldAmount.innerHTML = amount;

  fieldType.className = "ingredientEditeble";
  fieldType.id = "type_" + id;
  fieldType.innerHTML = type;

  fieldName.classList.add("ingredientEditeble");
  fieldName.classList.add("autocomplete");
  fieldName.id = "name_" + id;
  fieldName.list = datalista;
  fieldName.innerHTML = name;

  ingridient.appendChild(fieldAmount);
  ingridient.appendChild(fieldType);
  ingridient.appendChild(fieldName);

  infoFridge.append(ingridient);
}

function newWeeks() {
  spik = [];
  document.querySelector(".dagar").innerHTML = "";
  let i = 0;
  let c = "column1";
  fetch(API_URL + "ny-vecka")
    .then((response) => response.json())
    .then((result) => {
      result.forEach((item) => {
        if (i == 7) {
          i = 0;
          c = "column2";
        }
        pushFoodInfo(item.id, item.cName, dagar[i][0], 1, i, c, "dag");
        spik.push([item.id, dagar[i][0]]);
        i++;
      });
    });
}

function saveWeeks() {
  console.log(JSON.stringify(spik));

  fetch(API_URL + "spara-vecka", {
    method: "post",
    body: JSON.stringify(spik),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  }).then(function (data) {
    console.log("Request success: ", data.status);
    document.querySelector(".save").style.display = "None";
    document.querySelector("#success").className = "fade";

    let elm = document.getElementsByClassName("dag");
    for (var i = 0; i < elm.length; i == elm.length + 1) {
      document.getElementsByClassName("dag")[i].className = "mat";
    }
  });
}

function getWeeks() {
  let i = 0;
  let c = "column1";
  fetch(API_URL + "getweeks")
    .then((response) => response.json())
    .then((result) => {
      result.forEach((item) => {
        if (i == 7) {
          i = 0;
          c = "column2";
        }
        pushFoodInfo(item.id, item.cName, dagar[i][0], 1, i, c, "mat");
        i++;
      });
    });
}

function replaceFood(dag) {
  let excludeDay = dag;
  for (i = 0; i < spik.length; i++) {
    //console.log(spik[i][0])
    excludeDay = excludeDay + "," + spik[i][0];
  }
  fetch(API_URL + "dag" + excludeDay)
    .then((response) => response.json())
    .then((result) => {
      pushFoodInfo(result[0].id, result[0].cName, dag, 0, "", "dag");
    });
}

function viewFood(dag = 0) {
  for (var i = 0; i < elm.length; i++) {
    if (elm[i].id != "s" + dag) {
      elm[i].style.display = elm[i].style.display === "none" ? "block" : "none";
      info.style.display = info.style.display === "block" ? "none" : "block";
    } else {
      if (!elm[i].classList.contains("active")) {
        elm[i].classList.add("active");
        fetch(API_URL + "get-food-info" + dag)
          .then((respone) => respone.json())
          .then((result) => {
            infoTxt.textContent = result[0].cInfo;
            for (var i = 0; i < result.length; i++) {
              pushIngredientsInfo(
                result[i].cAmount,
                result[i].cAmountType,
                result[i].cV_Name.toLowerCase(),
                result[i].cV_Id
              );
            }
            recepieId = result[0].id;
          });
      } else {
        infoFridge.innerHTML = "";
        elm[i].classList.remove("active");
      }
    }
  }
}

function saveIngredient() {
  const saveData = [
    ("vara", vara.value),
    ("amount", amount.value),
    ("type", type.value),
    ("ny", newVara.value),
  ];

  fetch(API_URL + "saveIngredients", {
    method: "post",
    body: JSON.stringify(saveData),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      //console.log(result);
      pushIngredientsInfo(amount.value, type.value, vara.value, result);

      vara.value = "";
      amount.value = "";
      type.value = "";
      vara.focus();
    });
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

document.addEventListener("click", function (e) {
  if (e.target && e.target.className.toLowerCase() == "dag") {
    replaceFood(e.target.id.replace("s", ""));
  }
  if (e.target && e.target.classList.contains("mat")) {
    viewFood(e.target.id.replace("s", ""));
  }
});

document.addEventListener("dblclick", function (e) {
  if (e.target && e.target.classList.contains("ingredientEditeble")) {
    let target = document.getElementById(e.target.id);
    var newProdName = "";
    var newProdAmount = "";
    var newProdType = "";

    newProdName = prompt("Ändra:", target.innerText);

    if (e.target.id.split("_")[0] == "name") {
      console.log("1");
      if (newProdName.length > 0) {
        console.log(newProdName != target.innerText);
        if (newProdName != target.innerHTML) {
          fetch(API_URL + "ac" + newProdName)
            .then((response) => response.json())
            .then((result) => {
              if (result.length == 0) {
                newProdAmount = prompt(
                  "Produkten finns ej i databasen, vänligen ange vilken mängd produkten har vid inköp:"
                );
                newProdType = prompt(
                  "Ange om produkten mäts i vikt (g, kg), mängd (dl,l) eller förpackning (förp)"
                );
                console.log(newProdName, newProdAmount, newProdType);
              }
            });
        }
      }
    }
  }
});

//console.log(e.target.id.split("_")[0] + " " + e.target.id.split("_")[1]);
// fetch(
//   API_URL +
//     "updateRecepie" +
//     e.target.id.split("_")[0] +
//     "," +
//     e.target.id.split("_")[1],
//   e.target.innerHTML
// ).then(console.log("ok"));

setTimeout(() => {
  getWeeks();
}, 500);
