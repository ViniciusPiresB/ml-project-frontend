const APIUrl = "https://ml-project-backend.vercel.app/";
const ordersTable = document.getElementById("orders-table");
const warningText = document.getElementById("warning");

const sleep = (s) => new Promise((res) => setTimeout(res, s * 1000));

(async () => {
  while (true) {
    const ordersQuantityInHtml = document.getElementsByClassName("order");

    const response = await fetch(APIUrl + "order");
    const responseData = await response.json();

    if (response.status == 401) {
      warningText.innerHTML = responseData.message;
      throw new Error("User token invalid.");
    }

    const quantityOfOrdersFromApi = responseData.length;
    const quantityOfOrdersInHtml = ordersQuantityInHtml.length;

    if (quantityOfOrdersFromApi != quantityOfOrdersInHtml) {
      console.log("Updating table...");
      generateTable(responseData);
    }

    await sleep(30);
  }
})();

const generateTable = async (orders) => {
  const keys = [
    "count",
    "title",
    "value",
    "quantity",
    "username",
    "date_of_order",
    "manufacturing_ending_date",
    "variation"
  ];

  const tbl = document.getElementById("table");
  const tblExistingBody = document.getElementById("tbody");

  const tblBody = document.createElement("tbody");
  tblBody.setAttribute("id", "tbody");

  for (let i = 0; i < orders.length; i++) {
    const row = document.createElement("tr");
    row.classList.add("order");

    for (let j = 0; j < 8; j++) {
      if (keys[j] == "count") {
        const cell = document.createElement("td");
        const cellText = document.createTextNode(i + 1);

        cell.appendChild(cellText);
        row.appendChild(cell);
        continue;
      }

      if (keys[j] == "variation") {
        const variations = orders[i][keys[j]];

        const nameCell = document.createElement("td");

        if (variations.length == 0) {
          const nameTextCell = document.createTextNode("-");
          nameCell.appendChild(nameTextCell);
          row.appendChild(nameCell);
        }

        for (let k = 0; k < variations.length; k++) {
          const variationName = variations[k].name;

          const nameTextCell = document.createTextNode(variationName);

          nameCell.appendChild(nameTextCell);
          nameCell.appendChild(document.createElement("br"));
        }
        row.appendChild(nameCell);

        const valueCell = document.createElement("td");

        if (variations.length == 0) {
          const valueTextCell = document.createTextNode("-");
          valueCell.appendChild(valueTextCell);
          row.appendChild(valueCell);
        }

        for (let k = 0; k < variations.length; k++) {
          const valueTextCell = document.createTextNode(variations[k].value);

          valueCell.appendChild(valueTextCell);
          valueCell.appendChild(document.createElement("br"));
        }
        row.appendChild(valueCell);

        continue;
      }

      const cell = document.createElement("td");

      if (keys[j] == "date_of_order") {
        const hourDayMonth = convertDate(orders[i][keys[j]]);

        const cellText = document.createTextNode(hourDayMonth);

        cell.appendChild(cellText);
        row.appendChild(cell);
        continue;
      }

      let cellText = document.createTextNode(orders[i][keys[j]]);

      if (keys[j] == "manufacturing_ending_date") {
        const dateOfManufacturing = convertDate(orders[i][keys[j]]);
        let valueTextNode = "";

        valueTextNode = dateOfManufacturing;
        if (!dateOfManufacturing) {
          valueTextNode = "-";
          row.classList.add("table-danger");
        } else {
          if (isExpired(orders[i][keys[j]])) row.classList.add("table-danger");
        }

        cellText = document.createTextNode(valueTextNode);
      }

      if (keys[j] == "value")
        cellText = document.createTextNode("R$" + orders[i][keys[j]]);

      cell.appendChild(cellText);
      row.appendChild(cell);
    }

    tblBody.appendChild(row);
  }

  if (tblExistingBody) {
    tbl.removeChild(tblExistingBody);
  }

  tbl.appendChild(tblBody);
  ordersTable.appendChild(tbl);
};

const convertDate = (utcDate) => {
  if (!utcDate) return null;

  const utcDateTime = new Date(utcDate);
  utcDateTime.setHours(utcDateTime.getHours() + 4);
  const brDateString = utcDateTime.toLocaleString("en-GB", {
    timeZone: "America/Sao_Paulo"
  });

  const dayMonth = brDateString.substring(0, 5);
  const hour = brDateString.substring(12, 17);

  const hourDayMonth = `${hour} ${dayMonth}`;

  return hourDayMonth;
};

const isExpired = (utcManufacturingDate) => {
  const dateManufacturing = new Date(utcManufacturingDate);
  const dateNow = new Date();

  dateManufacturing.setHours(dateManufacturing.getHours() + 4);

  if (dateNow > dateManufacturing) return true;

  return false;
};
