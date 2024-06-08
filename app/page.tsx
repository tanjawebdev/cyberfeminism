import Image from "next/image";
import variables from "@styles/variables.module.scss";

export default function Home() {
  return (
        <main>
          <div className={variables.title}>Hello Scss</div>
          <div className="container">
            <div className="grid">
              <div className="g-col-md-4">Test</div>
              <div className="g-col-md-4">Test</div>
              <div className="g-col-md-4">Test</div>
            </div>
          </div>
          <div className={variables.title}>
            <p>
              Get started by editing&nbsp;
              <code>app/page.tsx</code>
            </p>
            <div>
              <a
                href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                By{" "}
                <Image
                  src="/vercel.svg"
                  alt="Vercel Logo"
                  width={100}
                  height={24}
                  priority
                />
              </a>
            </div>
          </div>

          <div>
            <Image
              src="/next.svg"
              alt="Next.js Logo"
              width={180}
              height={37}
              priority
            />
          </div>


        </main>
  );
}
