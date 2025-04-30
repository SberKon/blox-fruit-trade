Sure, here's the contents for the file: /vercel-api/vercel-api/src/utils/database.ts

import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(__dirname, '../../data/all_fruits.json');

export const readData = () => {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
};

export const writeData = (data: any) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};