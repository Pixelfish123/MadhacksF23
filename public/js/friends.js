var currUser;

document.addEventListener('DOMContentLoaded', async function () {
    currUser = JSON.parse(document.cookie.split("=")[1]);
    document.getElementById("profileName").innerHTML = currUser.displayName;


    db = firebase.firestore();

    currDataRef = await db.collection("users").doc(currUser.uid).get()
    currData = currDataRef.data();

    document.getElementById("friendsList").innerHTML = await generateFriends(currData.friends);
});


async function generateFriends(friends) {
    var result = "";
    for (let i = 0; i < Math.floor(friends.length / 2); i++) {
        result += '<div class="row">';
        result += await generateFriendsCard(friends[i * 2]);
        result += await generateFriendsCard(friends[i * 2 + 1]);
        result += '</div>';
    }

    if (friends.length % 2 == 1) {
        result += '<div class="row">';
        result += await generateFriendsCard(friends[friends.length - 1]);
        result += '</div>';
    }

    return result;
}

async function generateFriendsCard(data) {
    var personRef = await db.collection("users").doc(data.id).get();
    var pdata = personRef.data();

    return `<div class="col-md-6">
                <div class="product-item mb-3">
                    <div class="bg-light card-body">
                        <h5 class="card-title">${pdata.first + " " + pdata.last}</h5>
                        <div class="container row">
                            <p class="row-4 card-text pr-3">${pdata.email}</p>
                        </div>
                    </div>
                </div>
            </div>`;
}

async function showInfoCard() {
    var inputVal = document.getElementById('searchInput').value;
    var infoCard = document.getElementById('infoCard');

    var fullName = "";
    var docId;

    console.log(isValidEmail(inputVal));

    if (isValidEmail(inputVal)) {
        var querySnapshot = await db.collection("users").where("email", "==", inputVal).get()

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            var docData = doc.data();

            if (!docData.friends.some(friend => friend.id == currUser.uid)) {
                fullName = docData.first + " " + docData.last;
                docId = doc.id;
                console.log(fullName)
            }
        });


        console.log(fullName);

        if (fullName != "") {
            console.log(infoCard);
            infoCard.style.display = 'block';
            infoCard.getElementsByClassName('card-title')[0].innerText = fullName;
            infoCard.getElementsByClassName('card-text')[0].innerText = inputVal;

            document.getElementById("addButton").onclick = async function () {
                await addUser(docId);
            }
        }
    } else {
        infoCard.style.display = 'none';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function addUser(friendId) {
    var friendRef = await db.collection("users").doc(friendId).get();
    var friendData = friendRef.data();

    var currRef = await db.collection("users").doc(currUser.uid).get();
    var currData = currRef.data();

    friendData.friends.push(db.collection("users").doc(currUser.uid));
    currData.friends.push(db.collection("users").doc(friendId));

    await db.collection("users").doc(friendId).update({ friends: friendData.friends });
    await db.collection("users").doc(currUser.uid).update({ friends: currData.friends });

    document.getElementById('searchInput').value = "";
    document.getElementById('infoCard').style.display = 'none';

    document.getElementById("friendsList").innerHTML = await generateFriends(currData.friends);
}