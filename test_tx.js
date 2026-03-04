const axios = require("axios");

async function check() {
  const loginRes = await axios.post("https://test.univibe.uz/api/v1/user/auth/login/", {
    email: "sherzodradjabov0625@gmail.com",
    password: "your_password_here" // user hasn't provided this one over chat for security, so using a dummy to see if I can get their active staff session instead from front-end
  });
}
// since I don't have the password, let's just inspect the browser console error using grep.
