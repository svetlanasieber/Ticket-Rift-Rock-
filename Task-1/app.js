window.addEventListener("load", solve);

function solve() {
  let ticketNumElement = document.getElementById("num-tickets");
  let seatingElement = document.getElementById("seating-preference");
  let nameElement = document.getElementById("full-name");
  let emailElement = document.getElementById("email");
  let phoneElement = document.getElementById("phone-number");
  let btnElement = document.getElementById("purchase-btn");
  let ticketListElement = document.getElementById("ticket-preview");
  let purchasedListElement = document.getElementById("ticket-purchase");
  let bottomElement = document.querySelector(".bottom-content");

  btnElement.addEventListener("click", onAdd);

  function onAdd(e) {
    e.preventDefault();
    if (
      ticketNumElement.value == "" ||
      seatingElement.value == "" ||
      nameElement.value == "" ||
      emailElement.value == "" ||
      phoneElement.value == ""
    ) {
      return;
    }

    let articleElementInfo = document.createElement("article");
    let liElementInfo = document.createElement("li");
    liElementInfo.setAttribute("class", "ticket-purchase");
    let btnContainer = document.createElement("div");
    btnContainer.setAttribute("class", "btn-container");

    let ticketNumber = document.createElement("p");
    ticketNumber.textContent = `Count: ${ticketNumElement.value}`;

    let seatingPref = document.createElement("p");
    seatingPref.textContent = `Preference: ${seatingElement.value}`;

    let fullName = document.createElement("p");
    fullName.textContent = `To: ${nameElement.value}`;

    let email = document.createElement("p");
    email.textContent = `Email: ${emailElement.value}`;

    let pNumber = document.createElement("p");
    pNumber.textContent = `Phone Number: ${phoneElement.value}`;

    let editBtn = document.createElement("button");
    editBtn.setAttribute("class", "edit-btn");
    editBtn.textContent = "Edit";

    let nextBtn = document.createElement("button");
    nextBtn.setAttribute("class", "next-btn");
    nextBtn.textContent = "Next";

    articleElementInfo.appendChild(ticketNumber);
    articleElementInfo.appendChild(seatingPref);
    articleElementInfo.appendChild(fullName);
    articleElementInfo.appendChild(email);
    articleElementInfo.appendChild(pNumber);

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(nextBtn);

    liElementInfo.appendChild(articleElementInfo);
    liElementInfo.appendChild(btnContainer);

    ticketListElement.appendChild(liElementInfo);

    let editedticketNumElement = ticketNumElement.value;
    let editedseatingElement = seatingElement.value;
    let editednameElement = nameElement.value;
    let editedemailElement = emailElement.value;
    let editedphoneElement = phoneElement.value;

    ticketNumElement.value = "";
    seatingElement.value = "";
    nameElement.value = "";
    emailElement.value = "";
    phoneElement.value = "";

    btnElement.disabled = true;

    editBtn.addEventListener("click", onEdit);

    function onEdit() {
      ticketNumElement.value = editedticketNumElement;
      seatingElement.value = editedseatingElement;
      nameElement.value = editednameElement;
      emailElement.value = editedemailElement;
      phoneElement.value = editedphoneElement;

      liElementInfo.remove();
      btnElement.disabled = false;
    }

    nextBtn.addEventListener("click", onNext);

    function onNext() {
      let liElementconfirm = document.createElement("li");
      liElementconfirm.setAttribute("class", "ticket-purchase");

      let articleElementContinue = document.createElement("article");
      articleElementContinue = articleElementInfo;

      let buyBtn = document.createElement("button");
      buyBtn.setAttribute("class", "buy-btn");
      buyBtn.textContent = "Buy";

      articleElementContinue.appendChild(buyBtn);
      liElementconfirm.appendChild(articleElementContinue);

      liElementInfo.remove();

      purchasedListElement.appendChild(liElementconfirm);

      buyBtn.addEventListener("click", onBuy);

      function onBuy() {
        liElementconfirm.remove();

        let backBtn = document.createElement("button");
        backBtn.setAttribute("class", "back-btn");
        backBtn.textContent = "Back";

        let text = document.createElement("h2");
        text.textContent = `Thank you for your purchase!`;
        bottomElement.appendChild(text);
        bottomElement.appendChild(backBtn);

        backBtn.addEventListener("click", onCancel);

        function onCancel() {
          window.location.reload();
        }
      }
    }
  }
}