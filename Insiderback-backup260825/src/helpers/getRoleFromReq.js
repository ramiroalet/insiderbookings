export const getRoleFromReq = (req) => {
  const tokenRaw = req?.user?.role ?? req?.user?.role_id;
  const tokenRole = Number(tokenRaw);

  const queryRaw = req?.query?.user_role ?? req?.headers?.["x-user-role"];
  const queryRole = Number(queryRaw);

  if (Number.isFinite(tokenRole)) {
    if (Number.isFinite(queryRole) && queryRole !== tokenRole) {
      console.warn(
        "[search][markup] role mismatch: token vs query/header",
        tokenRole,
        queryRole
      );
    }
    return tokenRole;
  }

  if (Number.isFinite(queryRole)) {
    console.warn("[search][markup] unauthenticated role ignored", queryRole);
  }
  return 1;
};
