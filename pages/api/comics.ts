import { NextApiRequest, NextApiResponse } from 'next'

export default (_: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json(["OK"])
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}