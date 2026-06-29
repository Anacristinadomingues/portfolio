document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) {
    console.error("GSAP ou ScrollTrigger nao foram carregados.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const progressBar = document.querySelector(".scroll-progress span");
  const cursorGlow = document.querySelector(".cursor-glow");
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const backToTop = document.querySelector(".back-to-top");

  let lenis = null;

  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      anchors: true,
      smoothWheel: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      stopInertiaOnNavigate: true
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
    lenis?.start();
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");

    if (isOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  });

  primaryNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  function updateScrollUi() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (progressBar) {
      gsap.set(progressBar, { scaleX: progress });
    }

    backToTop?.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.9);
  }

  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  backToTop?.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  });

  if (!prefersReducedMotion && cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    const moveGlowX = gsap.quickTo(cursorGlow, "x", { duration: 0.5, ease: "power3.out" });
    const moveGlowY = gsap.quickTo(cursorGlow, "y", { duration: 0.5, ease: "power3.out" });

    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.opacity = "1";
      moveGlowX(event.clientX);
      moveGlowY(event.clientY);
    });

    document.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  let heroSplit = null;

  if (window.SplitType) {
    heroSplit = new SplitType(".hero-title", { types: "words, chars" });

    [...document.querySelectorAll(".split-lines")].forEach((element) => {
      const split = new SplitType(element, { types: "lines" });
      split.lines.forEach((line) => {
        const inner = document.createElement("span");
        inner.classList.add("line-inner");
        inner.innerHTML = line.innerHTML;
        line.innerHTML = "";
        line.appendChild(inner);
      });
    });
  }

  const heroEntrance = gsap.timeline({ defaults: { ease: "power4.out" } });

  heroEntrance
    .from(".hero-grid", { opacity: 0, duration: 1.2 })
    .from(".hero-portrait-wrap", { opacity: 0, scale: 1.09, duration: 1.5 }, "<")
    .from(".hero-meta p", { opacity: 0, y: 12, stagger: 0.08, duration: 0.7 }, "-=0.9")
    .from(".hero-eyebrow", { opacity: 0, y: 18, duration: 0.75 }, "-=0.6")
    .from(heroSplit?.chars || ".hero-title", {
      opacity: 0,
      yPercent: 115,
      rotateX: -76,
      transformOrigin: "50% 100%",
      duration: 1.05,
      stagger: 0.017
    }, "-=0.58")
    .from(".hero-description", { opacity: 0, y: 24, duration: 0.8 }, "-=0.5")
    .from(".hero-actions .button", { opacity: 0, y: 18, stagger: 0.08, duration: 0.65 }, "-=0.5")
    .from(".scroll-hint", { opacity: 0, y: 18, duration: 0.7 }, "-=0.48");

  if (!prefersReducedMotion) {
    gsap.to(".hero-title", {
      opacity: 0,
      yPercent: -22,
      scale: 0.93,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      }
    });

    gsap.to(".hero-portrait", {
      yPercent: 15,
      scale: 1.05,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  gsap.utils.toArray(".reveal-up").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 38,
      duration: 0.95,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true
      }
    });
  });

  document.querySelectorAll(".split-lines").forEach((title) => {
    gsap.from(title.querySelectorAll(".line-inner"), {
      yPercent: 112,
      opacity: 0,
      duration: 1.05,
      stagger: 0.11,
      ease: "power4.out",
      scrollTrigger: {
        trigger: title,
        start: "top 86%",
        once: true
      }
    });
  });

  document.querySelectorAll("[data-count]").forEach((element) => {
    const target = Number(element.dataset.count) || 0;
    const counter = { value: 0 };

    gsap.to(counter, {
      value: target,
      duration: 1.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true
      },
      onUpdate: () => {
        element.textContent = Math.round(counter.value).toLocaleString("pt-BR");
      }
    });
  });

  gsap.to(".timeline-rail span", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 72%",
      end: "bottom 72%",
      scrub: true
    }
  });

  gsap.utils.toArray(".project-panel").forEach((panel) => {
    const media = panel.querySelector(".project-media");
    const content = panel.querySelector(".project-content");
    const title = panel.querySelector("h3");
    const summary = panel.querySelector(".project-summary");
    const tags = panel.querySelectorAll(".project-tags span");
    const buttons = panel.querySelectorAll(".project-open");

    if (!prefersReducedMotion) {
      gsap.fromTo(media,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }

    const projectTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: "top 68%",
        once: true
      }
    });

    projectTimeline
      .from(content.querySelector(".project-number"), { opacity: 0, y: 22, duration: 0.6 })
      .from(title, { opacity: 0, y: 80, duration: 0.9, ease: "power4.out" }, "-=0.36")
      .from(summary, { opacity: 0, y: 24, duration: 0.7 }, "-=0.5")
      .from(tags, { opacity: 0, y: 18, stagger: 0.07, duration: 0.45 }, "-=0.38")
      .from(buttons, { opacity: 0, y: 18, stagger: 0.06, duration: 0.45 }, "-=0.24");
  });

  if (!prefersReducedMotion) {
    gsap.to(".hero-orbit-one", {
      rotate: 22,
      xPercent: -6,
      yPercent: 8,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".contact-orbit", {
      rotate: 18,
      xPercent: -5,
      yPercent: -5,
      scrollTrigger: {
        trigger: ".contact",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true
      }
    });
  }

  const caseStudyButtons = document.querySelectorAll("[data-case-open]");
  const caseStudyDialogs = document.querySelectorAll(".case-study-modal");
  let lastCaseTrigger = null;

  function getFocusableElements(dialog) {
    return [...dialog.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hasAttribute("hidden"));
  }

  function openCaseStudy(dialog, trigger) {
    if (!dialog) return;

    lastCaseTrigger = trigger;
    body.classList.add("case-study-open");
    dialog.showModal();
    dialog.querySelector("[data-case-close]")?.focus();
  }

  function closeCaseStudy(dialog) {
    if (!dialog?.open) return;

    dialog.close();
    body.classList.remove("case-study-open");
    lastCaseTrigger?.focus();
  }

  caseStudyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.caseOpen);
      openCaseStudy(dialog, button);
    });
  });

  caseStudyDialogs.forEach((dialog) => {
    dialog.querySelectorAll("[data-case-close]").forEach((button) => {
      button.addEventListener("click", () => {
        closeCaseStudy(dialog);
      });
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeCaseStudy(dialog);
      }
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCaseStudy(dialog);
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialog);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });

    dialog.addEventListener("close", () => {
      body.classList.remove("case-study-open");
    });
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
});
