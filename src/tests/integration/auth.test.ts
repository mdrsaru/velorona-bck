import { Connection } from 'typeorm';

import graphqlRequest from '../utils/graphql-request';
import { connection } from '../utils/connection-manager';
import strings from '../../config/strings';

let _connection: Connection;
beforeAll(async () => {
  _connection = await connection();
});

afterAll(async () => {
  if (_connection) {
    await _connection.close();
  }
});

const LOGIN = `
  mutation ($input: LoginInput!) {
    Login(input: $input) {
      id
      token
      refreshToken
    }
  }
`;

describe('Auth Resolver', () => {
  describe('Login', () => {
    it('should should throw not found error for company_id', async () => {
      const response: any = await graphqlRequest({
        query: LOGIN,
        variables: {
          input: {
            email: 'employee@user.com',
            password: 'password',
            companyCode: 'vellorum',
          },
        },
      });

      let errors = response?.errors;

      expect(errors?.[0]?.details ?? '').toContain(strings.companyNotFound);
    });
  });
});
