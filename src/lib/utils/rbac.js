export const isAdmin = (user) => {
  return user.role === "admin";
};

export const isOrgAdmin = (user) => {
  return user.role === "sub-admin";
};

export const isUser = (user) => {
  return user.role === "user";
};

export const canManageOrganization = (user) => {
  return ["admin", "sub-admin"].includes(user.role);
};

export const canManagePlatform = (user) => {
  return user.role === "admin";
};