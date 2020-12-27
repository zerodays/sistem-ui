// USER LOOKS LIKE THIS:
// I haven't implemented refresh token or anything similar...
// {
//  'token': 'TOKEN',
// }

function getUserData() {
  return JSON.parse(localStorage.userData || null) || {};
}

function saveUserData(user) {
  localStorage.userData = JSON.stringify(user);
}

export {getUserData, saveUserData}