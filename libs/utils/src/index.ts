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
  cb: (t: T) => Promise<R>,
) {
  const result: R[] = [];
  for (const item of array) {
    const mapped = await cb(item);
    result.push(mapped);
  }

  return result;
}
