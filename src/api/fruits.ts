Sure, here's the contents for the file: /vercel-api/vercel-api/src/api/fruits.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'all_fruits.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const data = await fs.promises.readFile(dataFilePath, 'utf-8');
            const fruits = JSON.parse(data);
            const timestamp = new Date().toISOString();

            res.status(200).json({
                timestamp,
                fruits
            });
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving fruit data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}