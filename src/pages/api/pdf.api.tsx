import { NextApiRequest, NextApiResponse } from 'next';
import { Page, Text, Document, renderToString } from '@react-pdf/renderer';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const MyDocument = (): JSX.Element => (
        <Document>
            <Page>
                <Text>React-pdf</Text>
                <Text>React-pdf</Text>
                <Text>React-pdf</Text>
                <Text>React-pdf</Text>
            </Page>
        </Document>
    );

    const value = await renderToString(<MyDocument />);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', value.length.toString());
    res.end(value);
}

export default handler;
