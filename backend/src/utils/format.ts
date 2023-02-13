// build filter query
export const buildFilterQuery = (filter: any) => {
  let query: Record<string, any> = {};

  Object.entries(filter).forEach((entry) => {
    let [key, value] = entry;

    if (value) {
      query[key] = value;
    }
  });

  return query;
};
