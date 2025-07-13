import styles from './SpecDocument.module.css';

const SpecDocument: React.FC = () => {
    return (
        <div className={styles.specDocument}>
            <h1 className={styles.title}>Navigator Spec</h1>
            <p className={styles.description}>
                The purpose of this document is to outline the ideas behind the Navigator and spec out the interface as well as user experience.
            </p>

            <section className={styles.section}>
                <h2>Navigator main interface</h2>
                <p>
                    This is the basic view for the Navigator's interface when it's triggered. It should use default materials, colors and typography.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Closing the Navigator</h2>
                <p>
                    When the user interacts with the Navigator it stays open unless they launch (i.e. double-click) Artipoint or Stream.
                    Clicking outside the Navigator means the user is no longer interacting with the Navigator hence clicking outside should collapse it.
                </p>

                <p>There are two exceptions when the Navigator should not auto-close:</p>
                <ol>
                    <li>Key modifier (Option) is pressed.</li>
                    <li>Navigator is "pinned".</li>
                </ol>
            </section>

            <section className={styles.section}>
                <h2>Sizing & Scrolling</h2>
                <p>
                    Navigator's size should be fixed and determined by the user. In other words, the Navigator's window should be resizable (height & width) as any other app.
                </p>
                <p>
                    The whole list is one scrollable container (i.e. individual Streams are not scrollable independently).
                </p>
            </section>

            <section className={styles.section}>
                <h2>Artipoints UI</h2>
                <p>
                    URL Artipoints have a 2nd line of text with domain name. In future versions, we may want to show the 2nd line of text for other types of Artipoints.
                </p>
                <p>
                    The most recently active window when the Navigator was launched should be both selected (blue background) and have a little dot in front of the name indicating it's the most recently active artipoint.
                </p>
            </section>
        </div>
    );
};

export default SpecDocument;
