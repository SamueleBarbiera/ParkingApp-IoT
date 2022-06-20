import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { withValidation } from 'next-validations'
import * as yup from 'yup'

const schema = yup.object().shape({
    rfid_stato: yup.boolean().required(),
    minuti_sosta: yup.number().required(),
    piano: yup.number().required(),
    posto: yup.number().required(),
})

const validate = withValidation({
    schema,
    type: 'Yup',
    mode: 'body',
})

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        rfid_stato: boolean
        minuti_sosta: number
        piano: number
        posto: number
    }
}

// una volta confermata l'associazione con rfid
// ti invio una post con campo rfid settato e la durata in minuti di occupazione
// del posto parcheggio generata Random

const handle = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    const {  piano, posto } = req.body
    try {
        if (req.method === 'POST') {
            const trovaUltimoRecord = await prisma.parcheggi.findFirst({
                where: {
                    piano: piano,
                    posto: posto,
                    parcheggio_stato: false,
                },
            })
            const Occupazioneparcheggi = await prisma.parcheggi.update({
                where: { parcheggi_id: trovaUltimoRecord?.parcheggi_id },
                data: { parcheggio_stato: false, rfid_stato: false },
            })

            res.status(200).json({ Occupazioneparcheggi })
        } else {
            res.status(400).json({
                ERRORE: 'si accettano solo POST REQ',
            })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export default validate(handle)