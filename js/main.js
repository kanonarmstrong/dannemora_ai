(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-copy");
      const el = target ? document.querySelector(target) : null;
      const text = el ? el.textContent.trim() : btn.getAttribute("data-copy-text");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = prev;
        }, 2000);
      } catch {
        btn.textContent = "Copy failed";
        setTimeout(() => {
          btn.textContent = "Copy to clipboard";
        }, 2000);
      }
    });
  });

  const navToggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  const searchInput = $("#docs-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll("[data-doc-item]").forEach((item) => {
        const hay = item.textContent.toLowerCase();
        item.style.display = !q || hay.includes(q) ? "" : "none";
      });
    });
  }

  const cancelBtn = $("#cancel-subscription-btn");
  const modal = $("#cancel-modal");
  const modalClose = $("#cancel-modal-close");
  const modalDismiss = $("#cancel-modal-dismiss");

  function openModal() {
    if (modal) modal.classList.add("is-open");
  }

  function closeModal() {
    if (modal) modal.classList.remove("is-open");
  }

  if (cancelBtn) cancelBtn.addEventListener("click", openModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalDismiss) modalDismiss.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const regenBtn = $("#regenerate-key-btn");
  if (regenBtn) {
    regenBtn.addEventListener("click", () => {
      const ok = window.confirm(
        "Regenerate your license key? The old key will stop working immediately for any running agents."
      );
      if (ok) {
        window.alert(
          "Demo only: connect your backend to issue a new key and persist it to Stripe metadata."
        );
      }
    });
  }

  const magicForm = $("#magic-link-form");
  if (magicForm) {
    magicForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("#signin-email")?.value?.trim();
      if (!email) return;
      window.alert(
        `Demo: we would email a magic link to ${email}. Wire this form to your auth provider.`
      );
    });
  }

  const billingToggles = document.querySelectorAll("[data-billing-toggle]");
  if (billingToggles.length) {
    const tierEl = $("#pricing-tier");
    const amountEl = $("#pricing-amount");
    const noteEl = $("#pricing-note");
    const savingsBadgeEl = $("#pricing-savings-badge");
    const subscribeLinkEl = $("#pricing-subscribe-link");
    const featuresEl = $("#pricing-features");

    const API = "https://api.dannemora.ai";

    const plans = {
      monthly: {
        tier: "Monthly",
        amountHtml: '<span class="price-card__primary-amount">$59</span><span style="font-size: 1rem; font-weight: 500">/mo</span>',
        note: "Monthly is higher cost. Switch to annual to save about $200/year for the same features.",
        savingsLabel: "Save ~$200/year by switching to annual",
        planId: "monthly",
        features: ["Same stuff. You'll just pay more over time."],
      },
      annual: {
        tier: "Annual",
        amountHtml:
          '<span class="price-card__primary-amount price-card__primary-amount--glow">$42</span><span style="font-size: 1rem; font-weight: 500">/mo</span><span class="price-card__billing">$499 billed annually</span>',
        note: "Lowest effective monthly price for the same full feature set.",
        savingsLabel: "Best value: save ~$200/year on annual",
        planId: "annual",
        features: [
          "3 autonomous agents (TL, Dev, QA)",
          "Secure durable message bus",
          "Hardened security layer",
          "Monitoring dashboard",
          "Telegram bot integration",
          "All future updates",
        ],
      },
    };

    let currentPlan = "annual";

    function setPlan(planKey) {
      const plan = plans[planKey];
      if (!plan || !tierEl || !amountEl || !noteEl || !savingsBadgeEl || !subscribeLinkEl) return;

      currentPlan = planKey;
      tierEl.textContent = plan.tier;
      amountEl.innerHTML = plan.amountHtml;
      noteEl.textContent = plan.note;
      savingsBadgeEl.textContent = plan.savingsLabel;
      subscribeLinkEl.href = "#";
      if (featuresEl) {
        featuresEl.innerHTML = (plan.features || [])
          .map((item) => `<li>${item}</li>`)
          .join("");
      }

      billingToggles.forEach((btn) => {
        const isActive = btn.getAttribute("data-billing-toggle") === planKey;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    // Handle subscribe click — create Stripe checkout session via API
    if (subscribeLinkEl) {
      subscribeLinkEl.addEventListener("click", async (e) => {
        e.preventDefault();
        const prevText = subscribeLinkEl.textContent;
        subscribeLinkEl.textContent = "Redirecting...";
        subscribeLinkEl.style.pointerEvents = "none";
        try {
          const resp = await fetch(`${API}/v1/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: currentPlan }),
          });
          const data = await resp.json();
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            throw new Error(data.error || "Failed to create checkout session");
          }
        } catch (err) {
          subscribeLinkEl.textContent = prevText;
          subscribeLinkEl.style.pointerEvents = "";
          window.alert("Something went wrong: " + err.message);
        }
      });
    }

    billingToggles.forEach((btn) => {
      btn.addEventListener("click", () => setPlan(btn.getAttribute("data-billing-toggle")));
    });

    // Default to annual so users see the lowest effective monthly price first.
    setPlan("annual");
  }

  function setupHomepageRevealAnimations() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    document.body.classList.add("animate-home");

    const heroGrid = hero.querySelector(".hero__grid");
    const heroItems = heroGrid ? Array.from(heroGrid.children) : [];
    heroItems.forEach((el) => el.classList.add("hero-load-item"));

    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
    });

    const rootStyles = getComputedStyle(document.documentElement);
    const parseTimeToSeconds = (value, fallback) => {
      if (!value) return fallback;
      const normalized = value.trim();
      if (normalized.endsWith("ms")) {
        const parsed = Number.parseFloat(normalized.replace("ms", ""));
        return Number.isFinite(parsed) ? parsed / 1000 : fallback;
      }
      if (normalized.endsWith("s")) {
        const parsed = Number.parseFloat(normalized.replace("s", ""));
        return Number.isFinite(parsed) ? parsed : fallback;
      }
      const parsed = Number.parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const revealStaggerSeconds = parseTimeToSeconds(rootStyles.getPropertyValue("--reveal-stagger"), 0.2);

    const revealTargets = [];
    const addRevealTarget = (element, delaySeconds = 0) => {
      if (!element) return;
      element.classList.add("reveal-item");
      element.style.setProperty("--reveal-delay", `${delaySeconds.toFixed(3)}s`);
      element.dataset.revealDelay = delaySeconds.toString();
      revealTargets.push(element);
    };

    document.querySelectorAll("main > section:not(.hero) .section__head").forEach((head) => {
      Array.from(head.children).forEach((child, index) => addRevealTarget(child, index * revealStaggerSeconds));
    });
    document.querySelectorAll("main > section:not(.hero) .cta-banner").forEach((banner) => addRevealTarget(banner, 0));

    document.querySelectorAll(".feature-row").forEach((row) => {
      const content = row.querySelector(".feature-row__content");
      const textItems = content ? Array.from(content.children) : [];
      textItems.forEach((item, index) => addRevealTarget(item, index * revealStaggerSeconds));

      const roleImage = row.querySelector(".role-image-reveal");
      const imageDelay = textItems.length * revealStaggerSeconds;
      addRevealTarget(roleImage, imageDelay);
    });

    const stepCards = Array.from(document.querySelectorAll(".steps .step-card"));
    stepCards.forEach((card, index) => addRevealTarget(card, index * revealStaggerSeconds));

    const revealDurationSeconds = parseTimeToSeconds(rootStyles.getPropertyValue("--reveal-duration"), 0.6);
    const pendingTargets = new Set();
    const revealQueue = [];
    let isProcessingQueue = false;

    const processQueue = () => {
      if (isProcessingQueue || revealQueue.length === 0) return;
      isProcessingQueue = true;

      const target = revealQueue.shift();
      target.classList.add("is-visible");

      const delaySeconds = Number.parseFloat(target.dataset.revealDelay || "0") || 0;
      const waitMs = Math.max(0, Math.round((delaySeconds + revealDurationSeconds) * 1000));

      window.setTimeout(() => {
        isProcessingQueue = false;
        processQueue();
      }, waitMs);
    };

    const enqueueTarget = (target) => {
      if (pendingTargets.has(target) || target.classList.contains("is-visible")) return;
      pendingTargets.add(target);
      revealQueue.push(target);
      processQueue();
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          enqueueTarget(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealTargets.forEach((target) => observer.observe(target));
  }

  setupHomepageRevealAnimations();
})();
