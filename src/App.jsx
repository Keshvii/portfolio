import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowDownRight, ArrowUpRight, BookOpen,
  Github, GraduationCap, Linkedin, Mail,
  Menu, MessageCircle, Sparkles, X,
} from "lucide-react";
import { portfolio } from "./data/portfolio.js";
import Chatbot from "./components/Chatbot.jsx";

const navLinks = [
  ["Work", "projects"], ["Research", "research"], ["About", "about"], ["Contact", "contact"],
];

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function Header({ onOpenProfile }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <button className="profile-thumb" type="button" onClick={onOpenProfile} aria-label="View Keshvi’s full profile photo"><img src={`${import.meta.env.BASE_URL}keshvi-profile.png`} alt="" /></button>
    <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
      {navLinks.map(([label, href]) => <a key={href} href={`#${href}`} onClick={() => setOpen(false)}>{label}</a>)}
      <a className="nav-cta" href={`mailto:${portfolio.email}`}>Let’s talk <ArrowUpRight size={14} /></a>
    </nav>
    <button className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </header>;
}

function Hero({ onOpenProfile }) {
  return <section className="hero section-shell" id="top">
    <div className="hero-copy">
      <Reveal><div className="eyebrow"><span className="status-dot" /> DEVELOPER · RESEARCHER <span className="eyebrow-line" /></div></Reveal>
      <Reveal delay={0.08}><h1>Building with<br /><span>curiosity</span> in mind<span className="period">.</span></h1></Reveal>
      <Reveal delay={0.16}><p className="hero-intro">I’m <strong>Keshvi</strong> — a full stack developer and AI researcher turning complex ideas into thoughtful digital experiences.</p></Reveal>
      <Reveal delay={0.22}><div className="hero-actions">
        <a className="button button-primary" href="#projects">Explore my work <ArrowDownRight size={16} /></a>
        <a className="button button-quiet" href={`${import.meta.env.BASE_URL}Keshvi.pdf`} download>Download résumé <ArrowDown size={15} /></a>
      </div></Reveal>
      <Reveal delay={0.28}><div className="hero-socials">
        {portfolio.socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label === "GitHub" ? <Github size={15} /> : <Linkedin size={15} />}{social.label}<ArrowUpRight size={12} /></a>)}
      </div></Reveal>
    </div>
    <Reveal className="hero-art-wrap" delay={0.2}><button className="portrait-card" type="button" onClick={onOpenProfile} aria-label="Open full profile photo">
      <img src={`${import.meta.env.BASE_URL}keshvi-profile.png`} alt="Keshvi wearing a cream blazer and glasses" />
      <span className="portrait-caption"><span>FULL STACK DEVELOPER · AI RESEARCHER</span></span>
      <span className="portrait-index">PROFILE / 2026</span>
    </button></Reveal>
    <div className="hero-foot"><span>BASED IN ALIGARH, INDIA</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={12} /></a></div>
  </section>;
}

function SectionHeading({ index, kicker, title, description }) {
  return <div className="section-heading">
    <div className="section-index">{index} <span /></div>
    <div><div className="section-kicker">{kicker}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>
  </div>;
}

function ProjectVisual({ motif, name }) {
  return <div className={`project-visual ${motif}`} aria-label={`Abstract ${name} interface illustration`}>
    <div className="visual-top"><span className="mini-brand"><i /> {name}</span><span className="mini-dots">•••</span></div>
    {motif === "edu" ? <div className="edu-screen">
      <div className="mock-sidebar"><b>ES</b><i /><i /><i /><i /></div>
      <div className="mock-main"><div className="mock-greet">Good morning, Instructor <span>✳</span></div><div className="mock-stats"><i><b>04</b><small>ACTIVE LABS</small></i><i><b>128</b><small>STUDENTS</small></i><i><b>92%</b><small>SUBMISSIONS</small></i></div><div className="mock-row"><span>Weekly assignment</span><b>AI generated <span>↗</span></b></div><div className="mock-progress"><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="mock-foot"><span>● Python · Week 08</span><span>Open assignment ↗</span></div></div>
    </div> : motif === "portfolio" ? <div className="portfolio-screen">
      <div className="portfolio-browser-bar"><span /><span /><span /><i>keshvi.dev</i></div>
      <div className="portfolio-browser-content">
        <div className="portfolio-nav-preview"><b>k<span>.</span></b><span>WORK&nbsp;&nbsp; RESEARCH&nbsp;&nbsp; ABOUT</span></div>
        <div className="portfolio-hero-preview"><div><small>DEVELOPER · AI RESEARCHER</small><b>Building with<br /><em>curiosity</em> in mind.</b><span>Full stack development and applied AI.</span></div><div className="portfolio-portrait-shape"><i>k.</i></div></div>
        <div className="portfolio-work-preview"><small>SELECTED WORK</small><div><i>EduSync</i><i>Talk2Doc</i></div></div>
      </div>
      <div className="portfolio-assistant-preview"><span>✳ &nbsp; PORTFOLIO ASSISTANT</span><b>Ask about Keshvi’s work</b><i>Skills, projects, research…</i></div>
    </div> : <div className="talk-screen">
      <div className="phone-frame"><div className="phone-notch"/><span className="phone-greeting">Good afternoon, Aisha</span><small>Your consultation</small><div className="doctor-card"><div className="doctor-avatar">DR</div><div><b>Dr. Consultation</b><small>General physician</small></div><span className="online-dot" /></div><div className="appointment">UPCOMING SESSION <b>Today, 4:30 PM</b></div><div className="chat-preview"><span>Doctor</span><i>I've reviewed your report. Let's discuss it together.</i><small>2:42 PM</small></div><div className="phone-tab">⌂ &nbsp;&nbsp; ◷ &nbsp;&nbsp; ♡ &nbsp;&nbsp; ◉</div></div>
      <div className="chat-float"><span>Secure consultation</span><MessageCircle size={14} /></div>
    </div>}
    <div className="visual-label">PRODUCT SNAPSHOT <span>ABSTRACT UI</span></div>
  </div>;
}

function Projects() {
  return <section className="section-shell section-block" id="projects">
    <Reveal><SectionHeading index="01" kicker="SELECTED WORK" title={<>Software with<br /><span>purpose.</span></>} description="A selection of products built to make real workflows clearer, smarter, and more connected." /></Reveal>
    <div className="project-list">{portfolio.projects.map((project, i) => <Reveal key={project.name} delay={i * 0.08}>
      <article className="project-card">
        <ProjectVisual motif={project.motif} name={project.name} />
        <div className="project-info"><div className="project-meta"><span>{project.type}</span><span>/{project.number}</span></div>
          <h3>{project.name}</h3><h4>{project.title}</h4><p>{project.description}</p>
          <ul className="feature-list">{project.details.slice(0, 4).map((detail) => <li key={detail}><span>↗</span>{detail}</li>)}</ul>
          <div className="tag-list">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </article>
    </Reveal>)}</div>
  </section>;
}

function Research() {
  return <section className="section-shell section-block research-section" id="research">
    <Reveal><SectionHeading index="02" title={<>RESEARCH & <br /><span>PUBLICATIONS</span></>} description="Research at the intersection of language models, retrieval, and trustworthy information." /></Reveal>
    <div className="publication-grid">{portfolio.publications.map((paper, i) => <Reveal key={paper.doi} delay={i * 0.09}>
      <article className="publication-card"><div className="publication-top"><span className="paper-type"><BookOpen size={13} /> {paper.kind}</span><span className="paper-number">0{i + 1}</span></div>
        <div className="paper-rule" /><h3>{paper.title}</h3><div className="paper-meta"><span>{paper.publisher}</span><span>{paper.date}</span></div><p>{paper.summary}</p>
        <div className="tag-list">{paper.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a className="paper-link" href={paper.doi} target="_blank" rel="noreferrer">Read publication <ArrowUpRight size={15} /></a>
      </article>
    </Reveal>)}</div>
  </section>;
}

function Experience() {
  return <div className="experience-block"><div className="subsection-heading"><span>03 / EXPERIENCE</span><h3>Where I’ve<br /><em>contributed.</em></h3></div>
    <div className="timeline">{portfolio.experience.map((job) => <article className="timeline-item" key={`${job.role}-${job.organization}`}>
      <div className="timeline-marker"><i /></div><div className="timeline-date">{job.period}</div><div className="timeline-content"><h4>{job.role}</h4><div className="timeline-org">{job.organization} <span>· {job.location}</span></div><ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
    </article>)}</div>
  </div>;
}

function About() {
  return <section className="section-shell section-block about-section" id="about">
    <Reveal><SectionHeading index="03" title={<>A little about <br /><span>ME.</span></>}  /></Reveal>
    <div className="about-grid">
      <Reveal className="about-main"><Experience /></Reveal>
      <Reveal className="about-side" delay={0.1}><div className="education-card"><div className="card-overline"><GraduationCap size={15} /> EDUCATION</div>{portfolio.education.map((item) => <article className="education-item" key={item.degree}><div className="education-period">{item.period}</div><h4>{item.degree}</h4><p>{item.field}</p><div className="school-name">{item.school}</div><div className="education-result"><span>{item.result}</span>{item.distinction && <span className="rank-badge">{item.distinction}</span>}</div></article>)}</div>
        <div className="achievement-card"><div className="card-overline"><Sparkles size={14} /> RECOGNITION</div>{portfolio.achievements.map((item) => <div className="achievement-item" key={item}><span>✳</span>{item}</div>)}<div className="cert-list"><span>CERTIFICATIONS</span>{portfolio.certifications.map((cert) => <div key={cert}>{cert}<ArrowUpRight size={12} /></div>)}</div></div>
      </Reveal>
    </div>
  </section>;
}

function Skills() {
  return <section className="section-shell skills-section"><Reveal><div className="skills-header"><div><div className="section-kicker">04 / TOOLKIT</div><h2>Things I work <span>with.</span></h2></div><p>A practical toolkit across full stack development and applied AI.</p></div></Reveal>
    <div className="skill-grid">{portfolio.skills.map((group, i) => <Reveal key={group.category} delay={i * 0.05}><article className="skill-card"><span className="skill-count">0{i + 1}</span><h3>{group.category}</h3><div className="skill-items">{group.items.map((item) => <span key={item}>{item}</span>)}</div></article></Reveal>)}</div>
  </section>;
}

function Contact() {
  return <section className="contact-section" id="contact"><div className="section-shell contact-inner"><Reveal><div className="section-index">05 <span /></div><div className="section-kicker">HAVE A PROJECT OR QUESTION?</div><h2>Let’s make<br /><em>something matter.</em></h2><a className="contact-email" href={`mailto:${portfolio.email}`}>{portfolio.email}<ArrowUpRight size={18} /></a><div className="contact-buttons"><a className="button button-primary" href={`mailto:${portfolio.email}`}><Mail size={15} /> Get in touch</a><a className="button button-quiet" href={`${import.meta.env.BASE_URL}Keshvi.pdf`} download>Download résumé <ArrowDown size={15} /></a></div></Reveal>
      <Reveal className="contact-side" delay={0.12}><span>ELSEWHERE</span>{portfolio.socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label === "GitHub" ? <Github size={16} /> : <Linkedin size={16} />}{social.label}<ArrowUpRight size={14} /></a>)}<span className="contact-location">ALIGARH, INDIA<br />AVAILABLE FOR THOUGHTFUL COLLABORATIONS</span></Reveal>
    </div></section>;
}

function Footer() {
  return <footer className="footer section-shell"><a className="wordmark" href="#top">k<span>.</span></a><span>© {new Date().getFullYear()} Keshvi</span><a href="#top">BACK TO TOP <ArrowUpRight size={12} /></a></footer>;
}

function ProfileLightbox({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return <motion.div className="profile-lightbox" role="dialog" aria-modal="true" aria-label="Keshvi’s profile photo" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="lightbox-close" type="button" onClick={onClose} aria-label="Close profile photo"><X size={22} /></button>
    <motion.img src={`${import.meta.env.BASE_URL}keshvi-profile.png`} alt="Keshvi wearing a cream blazer and glasses" onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }} />
    <span> KESHVI · PROFILE </span>
  </motion.div>;
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => { const handler = () => setScrolled(window.scrollY > 30); handler(); window.addEventListener("scroll", handler, { passive: true }); return () => window.removeEventListener("scroll", handler); }, []);
  return <div className={scrolled ? "app scrolled" : "app"}><Header onOpenProfile={() => setProfileOpen(true)} /><main><Hero onOpenProfile={() => setProfileOpen(true)} /><Projects /><Research /><About /><Skills /><Contact /></main><Footer /><Chatbot /><AnimatePresence>{profileOpen && <ProfileLightbox onClose={() => setProfileOpen(false)} />}</AnimatePresence></div>;
}
