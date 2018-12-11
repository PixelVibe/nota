const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = "e2f3f3z4u7dumch";
const AUTH_URL =
`https://www.dropbox.com/oauth2/authorize\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`;


function extractAccessToken(redirectUri) {
  let m = redirectUri.match(/[#?](.*)/);
  if (!m || m.length < 1)
    return null;
  let params = new URLSearchParams(m[1].split("#")[0]);
  return params.get("access_token");
}

function validate(redirectURL) {
  // console.log(redirectURL);
  const accessToken = extractAccessToken(redirectURL);
  if (!accessToken) {
    throw "Authorization failure";
  }
  
  browser.storage.sync.set({
    token: accessToken
  });
}

/**
Authenticate and authorize using browser.identity.launchWebAuthFlow().
If successful, this resolves with a redirectURL string that contains
an access token.
*/
function authorize() {
  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL
  });
}

function getAccessToken() {
  authorize()
    .then(validate)
    .catch((error) => {
      console.log('error ', error);
    })
}

const b = document.getElementById('connect');
browser.storage.sync.get('token', (res) => {
  if (res.token) {
    b.innerText = 'You are authorized'
    b.setAttribute('disabled', true);
  };
});

b.addEventListener('click', (e) => {
  e.preventDefault();
  getAccessToken();
})