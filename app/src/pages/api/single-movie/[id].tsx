import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db("sample_mflix");
        const movie = await db
            .collection("movies")
            .findOne({ _id: new ObjectId(req.query.id as string) });
        res.json(movie);
    } catch (e) {
        console.error(e);
    }
}