import { apiDefinition } from './helpers';

export function loginApi() {
  return apiDefinition<{
    password: string,
    username: string
  },
  null,
  {
    token: string
  }>({
    endpoint: '/login',
    method: 'POST',
  });
}
