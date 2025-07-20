export function getGuestToken() {
  let token = localStorage.getItem('guest_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('guest_token', token);
  }
  return token;
}
