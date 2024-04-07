import { apiDefinition } from './helpers';

export function loginApi() {
  return apiDefinition<{
    password: string,
    username: string
  }, {
    token: string
  }>({
    endpoint: '/login',
    method: 'POST',
  });
}
