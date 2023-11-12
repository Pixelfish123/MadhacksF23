var currUser;

document.addEventListener('DOMContentLoaded', thing);

async function thing() {
    currUser = JSON.parse(document.cookie.split("=")[1]);
    document.getElementById("profileName").innerHTML = currUser.displayName;


    db = firebase.firestore();

    currData = await db.collection("users").doc(currUser.uid).get()

    var receipts = [];
    var rg = currData.data().receipts;


    for (let i = 0; i < rg.length; i++) {
        var doc = await db.collection("receipts").doc(rg[i].id).get()
        receipts.push(doc.data());
    }

    generateReceipts(receipts);
}

async function generateReceipts(data) {
    var str = "";
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        str += await generateReceiptsHelper(data[i], i);
    }
    document.getElementById("receipts").innerHTML = str;

    for (let i = 0; i < data.length; i++) {
        document.getElementById(`btn${i}`).addEventListener("click", function () {
            if (document.getElementById(`showMore${i}`).hidden)
                document.getElementById(`showMore${i}`).hidden = false;
            else
                document.getElementById(`showMore${i}`).hidden = true;
        });
    }
}

async function generateReceiptsHelper(data, i) {
    // var pi = data.details.findIndex(person => person.id === "1"); //change this to the index of the person you want to display
    // the contributers array is the array of references to the users who contributed to the receipt
    console.log(data.contributors);
    var pi = data.contributors.findIndex(person => person.id === currUser.uid); //change this to the index of the person you want to display
    return `
                <div class="col-12 pb-1 mx-2">
                    <div class=" product-item bg-light mb-4">
                        <div class="text-center py-4">
                            <div class="row cd-flex align-items-center justify-content-center mt-2">
                                <div class="col-1 mb-1 mt-1">
                                    <i class="fa-2x ${(data.owner.id == currUser.uid) ? "ri-vip-crown-2-fill" : "ri-user-fill"}"></i>
                                </div >
                                <div class="col-3">
                                    <h5>${data.store}</h5>
                                </div>
                                <div class="col-3">
                                    <h5>${data.total}</h5>
                                </div>
                                <div class="col-2">
                                    <h5>${Math.round(data.percentage[pi] * data.total * 100) / 100}</h5>
                                </div>
                                <div class="col-2 ${data.paid[pi] ? "bg-paid" : "bg-unpaid"}">
                                    <h5 class="bold-text">${data.paid[pi] ? "PAID" : "UNPAID"}</h5>
                                </div>
                                <div class="dropdown col-1">
                                    <button class="btn btn-secondary" type="button" id="btn${i}">
                                        <i class="ri-arrow-down-s-fill"></i>
                                    </button>
                                </div>
                            </div >

                            <div class="col-12 cd-flex align-items-center justify-content-center mt-2" id="showMore${i}" hidden>
                                ${await generateReceiptsDetailsHelper(data, pi)}
                            </div>
                        </div >
                    </div >
                </div >
    `;
}

async function generateReceiptsDetailsHelper(data, pi) {
    str = "";
    for (let i = 0; i < data.contributors.length; i++) {
        if (pi != i) {
            var contrRef = await db.collection("users").doc(data.contributors[i].id).get();
            var contr = contrRef.data()
            str += `<div class="row cd-flex align-items-center justify-content-center mt-2">
                        <div class="col-1 mb-1 mt-1">
                                    <i class="fa-2x ${(contr.id == data.owner.id) ? "ri-vip-crown-2-fill" : "ri-user-fill"}"></i>
                        </div>
                        <div class="col-2">
                            <h7>${contr.first} ${contr.last}</sh7>
                        </div>
                        <div class="col-2">
                            <h7>${data.percentage[i]}</h7>
                        </div>
                        <div class="col-2">
                            <h7>${Math.round(data.percentage[i] * data.total * 100) / 100}</h7>
                        </div>
                        <div class="col-2 ${data.paid[i] ? "bg-paid" : "bg-unpaid"}">
                            <h7 class="bold-text">${data.paid[i] ? "PAID" : "UNPAID"}</h7>
                        </div>
                        <div class="dropdown col-2">
                        ${contr.friends.some((user) => currUser.uid == user.id) ? "" : `<button class="btn-primary col-12">+ Add Friend</button>`}
                        </div>
                    </div> `;
        }
    }

    return str;
}



function split() {
    contributors = document.getElementsByClassName("percent");

    var individual = Math.round(1 / (contributors.length + 1) * 100) / 100;

    for (let i = 0; i < contributors.length; i++) {
        contributors[i].value = individual;
    }

    document.getElementById("yourPercent").value = Math.round((1 - individual * contributors.length) * 100) / 100;
}



function addContributor() {
    const container = document.getElementById('contributorsContainer');
    const newContributor = document.createElement('div');
    newContributor.className = 'row align-items-center my-2'; // Use row for alignment
    newContributor.innerHTML = `<div class="col">
            <input type="text" class="form-control contributor-input" placeholder="Contributor name" oninput="showSuggestions(this)">
            <div class="suggestions-container d-none"></div> <!-- Hidden by default -->
        </div>
        <div class="col">
            <input type="number" class="form-control percent" placeholder="Percentage">
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeElement(this)">X</button>
        </div>`;
    container.appendChild(newContributor);
}

async function showSuggestions(inputElement) {
    const suggestionsContainer = inputElement.nextElementSibling;
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions
    suggestionsContainer.classList.remove('d-none'); // Show suggestions container

    // Example: Static list of suggestions (replace with your actual data)
    var currUserRef = await db.collection("users").doc(currUser.uid).get();
    friends = currUserRef.data().friends;

    var suggestions = [];

    for (let i = 0; i < friends.length; i++) {
        var friendRef = await db.collection("users").doc(friends[i].id).get();
        var friend = friendRef.data();
        suggestions.push(`${friend.first} ${friend.last}`);
    }

    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion-item';
        suggestionDiv.innerText = suggestion;
        suggestionDiv.onclick = () => selectContributor(inputElement, suggestion);
        suggestionsContainer.appendChild(suggestionDiv);
    });
}

function removeSuggestions(inputElement) {
    const suggestionsContainer = inputElement.nextElementSibling;
    suggestionsContainer.classList.add('d-none'); // Hide suggestions
}

function selectContributor(inputElement, name) {
    inputElement.value = name; // Set the input value to the selected name
    const suggestionsContainer = inputElement.nextElementSibling;
    suggestionsContainer.classList.add('d-none'); // Hide suggestions
}

function removeElement(button) {
    button.parentElement.parentElement.remove();
}

async function submitForm() {
    shopName = document.getElementById("shopName").value;
    total = document.getElementById("totalCost").value;
    yourPercent = document.getElementById("yourPercent").value;

    contributors = document.getElementsByClassName("contributor-input");
    percentages = document.getElementsByClassName("percent");


    var names = [currUser.displayName.split(" ")];
    var percentageList = [yourPercent];
    for (let i = 0; i < percentages.length; i++) {
        names.push(contributors[i].value.split(" "));
        percentageList.push(percentages[i].value);
    }

    var paid = [true, ...new Array(contributors.length).fill(false)];


    references = [];
    for (let i = 0; i < contributors.length; i++) {
        var querySnapshot = await db.collection("users").where("first", "==", names[i][0]).where("last", "==", names[i][1]).get();

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            references[i] = db.collection("users").doc(doc.id);
        });
    }

    var receipt = {
        owner: db.collection("users").doc(currUser.uid),
        store: shopName,
        total: Number(total),
        percentage: percentageList,
        paid: paid,
        contributors: references
    };


    var receiptRef = await db.collection("receipts").add(receipt);

    for (let i = 0; i < references.length; i++) {
        var userRef = await db.collection("users").doc(references[i].id).get();
        var userData = userRef.data();
        userData.receipts.push(db.collection("receipts").doc(receiptRef.id));
        await db.collection("users").doc(references[i].id).update({ receipts: userData.receipts });
    }

    document.getElementById("close-modal").click();
    await thing(receipts);
}