// =============================================================================
// views/serializers.js — shape domain records for the wire (View concern).
// Most important job: never leak password hashes to clients.
// =============================================================================
export function publicUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user;
  return safe;
}

export function publicUsers(users = []) {
  return users.map(publicUser);
}

export default { publicUser, publicUsers };
