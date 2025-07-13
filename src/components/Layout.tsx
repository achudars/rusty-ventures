import styles from './Layout.module.css';

interface LayoutProps {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ leftContent, rightContent }) => {
    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                {leftContent}
            </div>
            <div className={styles.rightPanel}>
                {rightContent}
            </div>
        </div>
    );
};

export default Layout;
