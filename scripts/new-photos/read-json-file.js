import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export async function readJSONFile(fileName) {
  try {
    const data = await readFile(fileName, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}