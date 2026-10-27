import Image from 'next/image';
import Atmosphere from './atmosphere';
import IntroSequence from './intro-sequence';
import ScrollDirectionCue from './scroll-direction-cue';

const works = [
  { image: 1, category: 'PRODUCT DESIGN', title: 'Portable Bottle', tone: 'light' },
  { image: 2, category: 'CMF & COLLECTION', title: 'Bottle Family', tone: 'wide' },
  { image: 3, category: 'PRODUCT DETAIL', title: 'Dual Form', tone: 'light' },
  { image: 4, category: 'INDUSTRIAL DESIGN', title: 'Intelligent System', tone: 'dark wide' },
  { image: 5, category: 'EQUIPMENT DESIGN', title: 'Precision Machine', tone: 'wide' },
  { image: 6, category: 'HOME APPLIANCE', title: 'Air System 01', tone: 'light' },
  { image: 7, category: 'HOME APPLIANCE', title: 'Air System 02', tone: 'light' },
  { image: 10, category: 'PRODUCT FAMILY', title: 'Climate Collection', tone: 'light wide' },
  { image: 9, category: 'CLIMATE SYSTEM', title: 'Vertical Air Unit', tone: 'light' },
  { image: 8, category: 'ENGINEERING VISUAL', title: 'Core Technology', tone: 'light' },
  { image: 11, category: 'MEDICAL DESIGN', title: 'Lab Platform', tone: 'wide' },
  { image: 12, category: 'CONSUMER PRODUCT', title: 'Oral Care', tone: 'light wide' },
  { image: 13, category: 'VISUAL DIRECTION', title: 'Pineapple Campaign', tone: 'wide' },
];

export default function Home() {
  return (
    <main>
      <Atmosphere />
      <ScrollDirectionCue />
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="nav-mark" href="#top" aria-label="Back to top">
          <span className="nav-logo" aria-hidden="true" />
        </a>
        <span className="nav-line" aria-hidden="true" />
        <div className="nav-links">
          <a href="#top">INTRO</a>
          <a href="#work">WORK</a>
          <a href="#about">ABOUT</a>
          <a className="nav-contact" href="#contact">CONNECT</a>
        </div>
      </nav>

      <IntroSequence />

      <section className="work-section" id="work" data-atmosphere-opacity="0.3">
        <header className="section-heading">
          <p className="eyebrow">01 / SELECTED WORK</p>
          <h2>OBJECTS<br />IN FOCUS.</h2>
          <p className="section-intro">一组关于产品、系统与品牌视觉的设计实践。<br />以比例、细节与清晰表达构成每一次设计。</p>
        </header>

        <div className="work-grid">
          {works.map((work) => (
            <article className={`work-card ${work.tone}`} key={work.image}>
              <div className="work-image">
                <Image src={`/assets/work-${work.image}.jpg`} alt={`${work.title} — ${work.category}`} fill sizes="(max-width: 760px) 100vw, 50vw" />
                <span className="card-arrow" aria-hidden="true"><i className="site-arrow site-arrow-diagonal" /></span>
              </div>
              <div className="work-caption"><p>{work.category}</p><h3>{work.title}</h3><span>SELECTED WORK / 2026</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about" data-atmosphere-opacity="0.3">
        <div className="about-copy">
          <p className="eyebrow">02 / ABOUT CHENEY</p>
          <h2>DESIGN WITH<br />PRESENCE.</h2>
          <p className="about-lead">关注工业设计与视觉表达，让产品的功能、形态和品牌感知成为一个完整的体验。</p>
          <p className="about-body">这是一份持续更新的个人作品档案。当前展示涵盖消费产品、家电设备、工业系统、医疗设备与品牌视觉。项目说明、履历与联系方式可在后续补充。</p>
          <div className="capabilities" aria-label="Capabilities">
            <span>INDUSTRIAL DESIGN</span><span>PRODUCT STRATEGY</span><span>CMF</span><span>VISUAL DIRECTION</span><span>RENDERING</span>
          </div>
        </div>
        <figure className="portrait-wrap">
          <Image src="/assets/portrait.jpg" alt="Portrait of Cheney" fill sizes="(max-width: 900px) 100vw, 45vw" />
          <figcaption><span>CHENEY</span><span>DESIGNER / CREATIVE</span></figcaption>
        </figure>
      </section>

      <section className="contact-section" id="contact" data-atmosphere-opacity="0.8">
        <div className="contact-top"><p className="eyebrow">03 / GET IN TOUCH</p><span>AVAILABLE FOR SELECTED PROJECTS</span></div>
        <h2>LET&apos;S MAKE<br />THE NEXT <em>THING.</em></h2>
        <div className="contact-bottom">
          <Image src="/assets/signature-black.png" alt="Cheney signature" width={1377} height={422} />
          <p>联系邮箱与社交账号待补充<br /><span>CONTACT DETAILS COMING SOON</span></p>
          <a href="#top" aria-label="Back to top"><i className="site-arrow site-arrow-up" aria-hidden="true" /></a>
        </div>
      </section>

      <footer><span>© 2026 CHENEY</span><span>INDUSTRIAL DESIGN · VISUAL DIRECTION</span><span>SHANGHAI / CHINA</span></footer>
    </main>
  );
}
