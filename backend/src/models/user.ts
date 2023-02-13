import { Schema, model } from "mongoose";
import { PasswordManager } from "./../utils/password-manager";
import { IdType, UserType, AccountType } from "./../types/user";

interface IUser {
  email: string;
  first_name?: string;
  last_name?: string;
  photo?: string;
  id_type?: IdType;
  location?: string;
  password: string;
  account_type?: string;
  user_type?: string;
  is_admin?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: Schema.Types.String, default: "" },
    last_name: { type: Schema.Types.String, default: "" },
    email: { type: Schema.Types.String, unique: true },
    photo: { type: Schema.Types.String, default: "" },
    password: { type: Schema.Types.String, default: "" },
    is_admin: { type: Schema.Types.Boolean, default: false },
    account_type: { type: Schema.Types.String, default: AccountType.FRACHISEE },
    user_type: { type: Schema.Types.String, default: UserType.NORMAL },
    id_type: {
      type: Schema.Types.String,
      enum: {
        values: Object.values(IdType),
        message: `Your id type can only be of the following,  ${Object.values(
          IdType
        ).join(",")}`,
      },
    },
    location: { type: Schema.Types.String, default: "" },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await PasswordManager.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
export const User = model<IUser>("User", userSchema);
