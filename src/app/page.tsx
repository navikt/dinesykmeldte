import React from 'react'

import ClientThingy from './ClientThingy'
import styles from './Page.module.css'

function Page(): JSX.Element {
    return (
        <div>
            <ClientThingy />
            <div className={styles.someStyle}>css div div mt-16</div>
            <div className="mt-16">tailwind div div mt-16</div>
        </div>
    )
}

export default Page
