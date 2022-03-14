export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthService {
  login(args: ILoginInput): Promise<any>;
}
