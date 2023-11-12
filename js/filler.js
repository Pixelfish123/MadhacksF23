var receipts;

fetch("https://raw.githubusercontent.com/Pixelfish123/MadhacksF23/main/js/data.json")
    .then(response => {
        return response.json();
    })
    .then((data) => {
        receipts = data;
        onStart();
    });




function onStart() {
    document.getElementById("profileName").innerHTML = "Rohit Raghunathan";
    generateReceipts(receipts);
}


function generateReceipts(data) {
    var str = "";
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        str += generateReceiptsHelper(data[i], i);
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

function generateReceiptsHelper(data, i) {
    var pi = data.details.findIndex(person => person.id === "1");; //change this to the index of the person you want to display
    return `
                <div class="col-12 pb-1 mx-2">
                    <div class=" product-item bg-light mb-4">
                        <div class="text-center py-4">
                            <div class="row cd-flex align-items-center justify-content-center mt-2">
                                <div class="col-1 mb-1 mt-1">
                                    <i class="${data.details[pi].isOwner ? "ri-vip-crown-2-fill" : "ri-user-fill"}"></i>
                                </div >
                                <div class="col-3">
                                    <h5>${data.shopname}</h5>
                                </div>
                                <div class="col-3">
                                    <h5>${data.total}</h5>
                                </div>
                                <div class="col-2">
                                    <h5>${data.details[pi].amount}</h5>
                                </div>
                                <div class="col-2">
                                    <h5>${data.details[pi].paid ? "Paid" : "Unpaid"}</h5>
                                </div>
                                <div class="dropdown col-1">
                                    <button class="btn btn-secondary" type="button" id="btn${i}">
                                        <i class="ri-arrow-down-s-fill"></i>
                                    </button>
                                </div>
                            </div >

                            <div class="col-12 cd-flex align-items-center justify-content-center mt-2" id="showMore${i}" hidden>
                                ${generateReceiptsDetailsHelper(data, pi, i)}
                            </div>
                        </div >
                    </div >
                </div >
    `;
}

function generateReceiptsDetailsHelper(data, pi, i) {
    str = "";
    for (let i = 0; i < data.details.length; i++) {
        if (pi != i) {
            str += `<div class="row cd-flex align-items-center justify-content-center mt-2">
                        <div class="col-1 mb-1 mt-1">
                                    <i class="${data.details[i].isOwner ? "ri-vip-crown-2-fill" : "ri-user-fill"}"></i>
                        </div>
                        <div class="col-2">
                            <h7>${data.details[i].firstname} ${data.details[i].lastname}</sh7>
                        </div>
                        <div class="col-2">
                            <h7>${data.details[i].percentage}</h7>
                        </div>
                        <div class="col-2">
                            <h7>${data.details[i].amount}</h7>
                        </div>
                        <div class="col-2">
                            <h7>${data.details[i].paid ? "Paid" : "Unpaid"}</h7>
                        </div>
                        <div class="dropdown col-2">
                            <button class="btn-primary col-12">+ Add Friend</button>
                        </div>
                    </div> `;
        }
    }

    return str;
}