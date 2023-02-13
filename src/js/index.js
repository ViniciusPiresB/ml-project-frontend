const APIUrl = "http://localhost:3000/";
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
  const keys = ["title", "quantity", "username", "date_of_order", "variation"];

  const tbl = document.getElementById("table");
  const tblExistingBody = document.getElementById("tbody");

  const tblBody = document.createElement("tbody");
  tblBody.setAttribute("id", "tbody");

  for (let i = 0; i < orders.length; i++) {
    const row = document.createElement("tr");
    row.classList.add("order");

    for (let j = 0; j < 5; j++) {
      if (keys[j] == "variation") {
        const variations = orders[i][keys[j]];

        const nameCell = document.createElement("td");
        for (let k = 0; k < variations.length; k++) {
          const nameTextCell = document.createTextNode(variations[k].name);

          nameCell.appendChild(nameTextCell);
        }
        row.appendChild(nameCell);

        const valueCell = document.createElement("td");
        for (let k = 0; k < variations.length; k++) {
          const valueTextCell = document.createTextNode(variations[k].value);

          valueCell.appendChild(valueTextCell);
        }
        row.appendChild(valueCell);

        continue;
      }

      const cell = document.createElement("td");

      if (keys[j] == "date_of_order") {
        const utcDate = new Date(orders[i][keys[j]]);
        utcDate.setHours(utcDate.getHours() + 4);
        const brDateString = utcDate.toLocaleString("en-GB", {
          timeZone: "America/Sao_Paulo"
        });

        const dayMonth = brDateString.substring(0, 5);
        const hour = brDateString.substring(12, 17);

        const hourDayMonth = `${hour} ${dayMonth}`;

        const cellText = document.createTextNode(hourDayMonth);

        cell.appendChild(cellText);
        row.appendChild(cell);
        continue;
      }

      const cellText = document.createTextNode(orders[i][keys[j]]);

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
