// JavaScript SDK
import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.28.0/+esm';

const pb = new PocketBase('https://9b271laeevbwh1k.pwz5.pocketbasecloud.com/');
console.log(pb) 

async function handleSignup() {
    const email = document.getElementById("signup_email").value
        .trim().toLowerCase();
    const password = document.getElementById("signup_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    const confirmMessage = document.getElementById("confirm_message");

    if (password !== confirmPassword) {
        if (confirmMessage) {
            confirmMessage.textContent = "Passwords do not match.";
        } else {
            alert("Passwords do not match.");
        }
        return;
    }

    if (confirmMessage) {
        confirmMessage.textContent = "";
    }

    // Save the email BEFORE requesting the OTP
    sessionStorage.setItem("signupEmail", email);

    try {
        await pb.send("/api/myapp/signup/request-otp", {
            method: "POST",

            // Prevent PocketBase from automatically cancelling
            // another request to the same endpoint
            requestKey: null,

            body: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }
        });

        alert("Verification code sent! Please check your email.");
        window.location.href = "./verify_otp.html";

    } catch (error) {
        console.error("Signup OTP error:", error);
        console.error("PocketBase response:", error.response);

        const message =
            error.response?.message || error.message || "";

        // An OTP may already have been sent, or the previous
        // request may still be within the 60-second cooldown.
        if (
            error.isAbort ||
            message.includes("wait 60 seconds")
        ) {
            alert("Please enter the OTP you received.");
            window.location.href = "./verify_otp.html";
            return;
        }

        alert("Unable to start signup: " + message);
    }
}

async function handleOtpVerification() {
    const email = sessionStorage.getItem("signupEmail");
    const otpCode = document.getElementById("otp_code").value.trim();

    if (!email) {
        alert("Please sign up first.");
        window.location.href = "./signup.html";
        return;
    }

    if (!otpCode) {
        alert("Please enter the OTP.");
        return;
    }

    try {
        // Verify the OTP and create the user account
        await pb.send("/api/myapp/signup/verify-otp", {
            method: "POST",
            body: {
                email: email,
                otp: otpCode
            }
        });

        sessionStorage.removeItem("signupEmail");

        alert("Email verified successfully! Your account has been created.");

        // Go to login after the account is created
        window.location.href = "./login.html";

    } catch (error) {
        console.error("OTP verification error:", error);
        console.log("PocketBase response:", error.response);

        alert(
            "Verification failed: " +
            (error.response?.message || error.message)
        );
    }
}


async function handleResendOtp() {
    const email = sessionStorage.getItem("signupEmail");

    if (!email) {
        alert("Please sign up first.");
        window.location.href = "./signup.html";
        return;
    }

    try {
        // Request a new OTP using the custom endpoint
        await pb.send("/api/myapp/signup/resend-otp", {
            method: "POST",
            body: {
                email: email
            }
        });

        alert("A new OTP has been sent. Please check your email.");

    } catch (error) {
        console.error("Resend OTP error:", error);
        console.log("PocketBase response:", error.response);

        alert(
            "Unable to resend OTP: " +
            (error.response?.message || error.message)
        );
    }
}


// REPLACE
// async function handleLogin() {
//   let email = document.getElementById("login_username").value
//   let password = document.getElementById("login_password").value
//   try {
//     await pb.collection('users').authWithPassword(email, password);
//     // Redirect to your protected dashboard/index page
//     window.location.href = './index.html';
//     document.getElementById('welcome').innerText = `Hello, ${user.email}`; 
//   } catch (error) {
//     alert('Login failed: ' + error.message);
//   }
// }
async function handleLogin() {
    const email = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;
    try {
        const authData = await pb.collection('users').authWithPassword(email,password);
        console.log("Login successful:", authData.record);
        // Redirect to your protected dashboard/index page
        window.location.href = './index.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Logout logic
function handleLogout() {
  pb.authStore.clear(); // Clears localStorage auth state
  // window.location.href = '/login.html';
}

// Connect the buttons 
const loginButton = document.getElementById("login_button");
const signupButton = document.getElementById("signup_button");
const otpButton = document.getElementById("verify_otp_button");
const resendOtpButton = document.getElementById("resend_otp_button");

if (loginButton) {
    loginButton.onclick = handleLogin;
}

if (signupButton) {
    signupButton.onclick = handleSignup;
}

if (otpButton) {
    otpButton.onclick = handleOtpVerification;
}

if (resendOtpButton) {
    resendOtpButton.onclick = handleResendOtp;
}
// // list and search for 'example' collection records
// const list = await pb.collection('example').getList(1, 100, {
//     filter: 'title != "" && created > "2022-08-01"',
//     sort: '-created,title',
// });

// // or fetch a single 'example' collection record
// const record = await pb.collection('example').getOne('RECORD_ID');

// // delete a single 'example' collection record
// await pb.collection('example').delete('RECORD_ID');

// // create a new 'example' collection record
// const newRecord = await pb.collection('example').create({
//     title: 'Lorem ipsum dolor sit amet',
// });

// // subscribe to changes in any record from the 'example' collection
// pb.collection('example').subscribe('*', function (e) {
//     console.log(e.record);
// });

// // stop listening for changes in the 'example' collection
// pb.collection('example').unsubscribe()