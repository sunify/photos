import fs from 'fs/promises';

export async function readJSONFile(fileName) {
  try {
    const data = await fs.readFile(fileName, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}