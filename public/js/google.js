function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            console.log(user);
            saveUserToCookies(user);
            createUserInDatabase(user); // Call function to create user in database
            window.location = "transactions.html";
        }).catch((error) => {
            console.error(error);
        });
}

function saveUserToCookies(user) {
    // Convert user information to a JSON string
    var userData = JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        // Add any other relevant user information
    });

    // Set the cookie with the user information
    document.cookie = "userData=" + userData + "; expires=Thu, 1 Jan 2099 00:00:00 UTC; path=/";
}

function createUserInDatabase(user) {
    const userRef = db.collection("users").doc(user.uid);

    userRef.get().then((doc) => {
        console.log(doc);
        if (!doc.exists) {
            userRef.set({
                first: user.displayName.split(" ")[0],
                last: user.displayName.split(" ")[1],
                email: user.email,
                receipts: [],
                friends: [],
                // additional user data
            });
            console.log("New user added to database");
        } else {
            console.log("User already exists in database");
        }
    }).catch((error) => {
        console.error("Error checking user in database: ", error);
    });
}

// Initialize Firebase


var db;

document.addEventListener('DOMContentLoaded', function () {
    // firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
});