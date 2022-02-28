import React from 'react';

import styles from './Skeleton.module.css';

interface Props {
    width?: number;
}

const Skeleton = ({ width }: Props): JSX.Element => {
    return <div className={styles.skeleton} style={{ width: width ?? '100%' }} />;
};

export default Skeleton;
