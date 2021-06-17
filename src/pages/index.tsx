import { Knapp } from 'nav-frontend-knapper';
import { Button } from '@navikt/ds-react';
import Head from 'next/head';
import React from 'react';

import styles from './index.module.css';

function Home(): JSX.Element {
    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <div className={styles.buttonWrapper}>
                <Knapp className={styles.button}>Eksempel på knapp fra gammelt design-system</Knapp>
                <Button className={styles.button}>Eksempel på knapp fra nytt design-system</Button>
            </div>
        </div>
    );
}

export default Home;
