export function randomHtmlName(length = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function getRandomColor () {
  return '#000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

export async function asyncMap<T, R> (
  array: T[],
  cb: (t: T, i: number) => Promise<R>,
) {
  const result: R[] = [];
  for (let i = 0; i < array.length; i += 1) {
    const mapped = await cb(array[i], i);
    result.push(mapped);
  }

  return result;
}

export function sanitizeForHtmlAttribute(value: string): string {
  if (!value) return '';

  return value
    .toLowerCase()
    // Replace spaces and underscores with dashes
    .replace(/[\s_]+/g, '-')
    // Remove any characters that aren't alphanumeric or dashes
    .replace(/[^a-z0-9-]/g, '')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

export interface Logger {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export class ConsoleLogger implements Logger {
  log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }
}

