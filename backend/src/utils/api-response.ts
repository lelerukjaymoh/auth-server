/** @format */
class ApiResponse {
  public page_info: object;
  constructor(public query: any, public queryString: any) {
    this.query = query;
    this.queryString = queryString;
    this.page_info = {};
  }

  filter() {
    const reqQuery = {
      ...this.queryString,
    };
    const excludedFields = ["page", "limit", "sort", "fields", "search"];
    excludedFields.forEach((el) => delete reqQuery[el]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString);
    } else {
      // default one
      this.query = this.query.sort("-created_at");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // api/v1/tours/?fields=name,price,duration
      const fields = this.queryString.fields.split(",").join("");
      // query = query.select('name duration price')
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // exclude __v field
    }
    return this;
  }

  paginate() {
    const page_query = this.queryString.page;
    if (page_query == "all") {
      return this;
    }
    const page = page_query * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    let prev_page = (page as number) - 1;
    let next = (page as number) + 1;

    if (prev_page === 0) {
      prev_page = 1;
    }

    this.page_info = {
      prev: prev_page,
      next: next,
      current: page,
      limit: limit,
    };
    return this;
  }
}

export { ApiResponse };
