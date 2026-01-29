export type UserBaseFormState = {
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  phone: string
}

export type UserCreateFormState = UserBaseFormState & {
  password: string
  password2: string
}

export type UserEditFormState = UserBaseFormState
