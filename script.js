"use strict";

/* ==========================================================
   CONFIGURATION : modifie ici tes liens et tes images.
   Les images vont dans le dossier "images" (à côté de index.html).
   ========================================================== */
const USER_ID = "1182733645388197948";
const CONFIG = {
  api: `https://api.tanox.fr/v1/users/${USER_ID}`,
  refreshMs: 15000,
  socials: [
    { name: "Discord", detail: "Mon profil Discord", icon: "D", url: `https://discord.com/users/${USER_ID}` },
    { name: "YouTube", detail: "Ma chaîne YouTube", icon: "▶", url: "https://youtube.com/@ACWiiCrafter" },
    { name: "GitHub", detail: "Mes projets et mon code", icon: "GH", url: "https://github.com/ACWiiCrafter" },
    { name: "Reddit", detail: "Mon compte Reddit", icon: "R", url: "https://www.reddit.com/user/ACWiiCrafter" },
    { name: "Steam", detail: "Mon profil Steam", icon: "S", url: "https://steamcommunity.com/profiles/76561199827680326" },
    { name: "Twitch", detail: "Ma chaîne Twitch", icon: "TW", url: "https://twitch.tv/acwiicrafter" }
  ],
  friends: [
    { name: "GDMC", detail: "Site de GDMC", url: "https://gdmcplayer.top/", image: "images/gdmc.png" },
    { name: "Ryanmcyt", detail: "Site de Ryanmcyt", url: "https://ryanmcyt.fr", image: "images/ryanmcyt.png" },
    { name: "Tanox9090", detail: "Site de Tanox9090", url: "https://tanox.fr", image: "images/tanox9090.png" },
    { name: "API Tanox9090", detail: "L'API du site", url: "https://api.tanox.fr", image: "images/tanox9090.png" },
    { name: "Komas19", detail: "Site de Komas19", url: "https://komas19.party", image: "images/komas19.png" }
  ],
  projects: [
    { name: "ReGalt", detail: "Découvrir le site", url: "https://regalt.fr", image: "images/regalt.png" },
    { name: "Only Friends", detail: "Rejoindre le Discord", url: "https://discord.gg/WfnMRzfcH4", image: "images/only-friends.png" },
    { name: "RagNun", detail: "Rejoindre le Discord", url: "https://discord.gg/dRxQpacNuj", image: "images/ragnun.png" },
    { name: "Love Zone", detail: "Rejoindre le Discord", url: "https://discord.gg/Xqj7qDy2fa", image: "images/love-zone.png" },
    { name: "RuXien", detail: "Rejoindre le Discord", url: "https://discord.gg/XJj4p6j2t5", image: "images/ruxien.png" },
    { name: "Mon Serveur", detail: "Rejoindre mon serveur", url: "https://discord.gg/8g6Eb8mNkx", image: "images/mon-serveur.png" }
  ]
};

const PAGES = ["profil", "reseaux", "amis", "projets", "scams"];
const $ = (id) => document.getElementById(id);

/* ---------- Navigation ---------- */
function navigate(pageId, scroll = true) {
  if (!PAGES.includes(pageId)) pageId = "profil";
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === pageId));
  document.querySelectorAll(".nav-link").forEach(b => {
    const on = b.dataset.page === pageId;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (location.hash !== `#${pageId}`) history.pushState(null, "", `#${pageId}`);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll(".nav-link").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));
window.addEventListener("hashchange", () => navigate(location.hash.slice(1), false));

/* ---------- Cartes ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(className, url) {
  const a = el("a", className);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

function createSocialCard(item) {
  const a = externalLink("card social-card", item.url);
  a.setAttribute("aria-label", `${item.name} : ${item.detail} (nouvel onglet)`);
  const text = el("span");
  text.append(el("span", "card-title", item.name), el("span", "card-sub", item.detail));
  a.append(el("span", "social-icon", item.icon), text, el("span", "arrow", "↗"));
  return a;
}

function createVisualCard(item) {
  const a = externalLink("card visual-card", item.url);
  a.setAttribute("aria-label", `${item.name} : ${item.detail} (nouvel onglet)`);
  const visual = el("div", "visual");
  visual.append(el("div", "visual-placeholder", item.name.charAt(0).toUpperCase()));
  const img = new Image();
  img.alt = `Image de ${item.name}`;
  img.loading = "lazy";
  img.addEventListener("error", () => img.remove());
  img.src = item.image;
  visual.append(img);
  const details = el("div", "details");
  const text = el("div");
  text.append(el("div", "card-title", item.name), el("p", "", item.detail));
  details.append(text, el("span", "arrow", "↗"));
  a.append(visual, details);
  return a;
}

CONFIG.socials.forEach(i => $("socialGrid").append(createSocialCard(i)));
CONFIG.friends.forEach(i => $("friendsGrid").append(createVisualCard(i)));
CONFIG.projects.forEach(i => $("projectsGrid").append(createVisualCard(i)));

/* ---------- Profil Discord (API Tanox) ---------- */
const STATUS_LABELS = { online: "En ligne", idle: "Absent", dnd: "Ne pas déranger", offline: "Hors ligne", invisible: "Hors ligne" };
let profileLoaded = false;

function pick(obj, keys) {
  for (const k of keys) { const v = obj?.[k]; if (v !== undefined && v !== null && v !== "") return v; }
  return null;
}

function updateDiscordStatus(status) {
  const key = typeof status === "string" ? status.toLowerCase() : "";
  $("discordStatus").textContent = STATUS_LABELS[key] || "Statut indisponible";
  $("statusDot").className = `status-dot ${STATUS_LABELS[key] ? key : ""}`;
}

function setInfoText(id, value, fallback = "Non disponible") {
  const node = $(id);
  if (node) node.textContent = value || fallback;
}

function renderCustomStatus(activities) {
  const custom = activities.find(activity => activity.type === 4 || activity.name === "Custom Status");
  if (!custom) {
    setInfoText("customStatus", "Aucun statut personnalisé");
    return;
  }

  const emoji = custom.emoji?.name ? `${custom.emoji.name} ` : "";
  setInfoText("customStatus", `${emoji}${custom.state || custom.details || "Statut personnalisé"}`);
}

function renderActivity(activities) {
  const activity = activities.find(item => item.type !== 4 && item.name !== "Custom Status");
  if (!activity) {
    setInfoText("currentActivity", "Aucune activité détectée");
    return;
  }

  const typeLabels = {
    0: "Joue à",
    1: "Diffuse",
    2: "Écoute",
    3: "Regarde",
    5: "Participe à"
  };
  const prefix = typeLabels[activity.type] || "Activité";
  const extra = activity.details || activity.state;
  setInfoText("currentActivity", `${prefix} ${activity.name}${extra ? ` — ${extra}` : ""}`);
}

function renderDevices(data) {
  const devices = [
    ["Ordinateur", data.active_on_discord_desktop],
    ["Navigateur", data.active_on_discord_web],
    ["Mobile", data.active_on_discord_mobile],
    ["Discord intégré", data.active_on_discord_embedded],
    ["Réalité virtuelle", data.active_on_discord_vr]
  ];
  const container = $("deviceList");
  container.replaceChildren();

  const active = devices.filter(([, connected]) => connected === true);
  if (active.length === 0) {
    container.append(el("span", "info-muted", "Aucun appareil détecté"));
    return;
  }

  active.forEach(([name]) => {
    container.append(el("span", "device-pill", `● ${name}`));
  });
}

function renderSpotify(data) {
  const spotify = data.spotify;
  if (!data.listening_to_spotify || !spotify) {
    setInfoText("spotifyInfo", "N'écoute pas Spotify actuellement");
    return;
  }

  const song = pick(spotify, ["song", "title", "track"]) || "Titre inconnu";
  const artist = pick(spotify, ["artist", "artists"]) || "Artiste inconnu";
  const album = pick(spotify, ["album"]) || "";
  setInfoText("spotifyInfo", `${song} — ${artist}${album ? ` (${album})` : ""}`);
}

function applyProfile(payload) {
  const data = payload.data || payload;
  const user = data.discord_user || data.user || data;
  const name = pick(user, ["global_name", "display_name", "displayName", "username", "name"]) || "ACWiiCrafter";
  const username = pick(user, ["username", "tag"]);
  $("discordName").textContent = name;
  $("discordTag").textContent = username ? `@${username}` : "Profil Discord";

  const avatar = pick(user, ["avatar_url", "avatarUrl", "avatar"]);
  if (typeof avatar === "string") {
    if (avatar.startsWith("https://")) $("discordAvatar").src = avatar;
    else if (avatar.length > 10) $("discordAvatar").src = `https://cdn.discordapp.com/avatars/${USER_ID}/${avatar}.png?size=256`;
  }

  const banner = "images/banniere.png";
  if (!$("discordBanner").firstChild) {
    const img = new Image();
    img.alt = "Bannière Final Fantasy VII";
    img.src = banner;
    $("discordBanner").append(img);
  }

  updateDiscordStatus(pick(data, ["discord_status", "status"]));

  const activities = Array.isArray(data.activities) ? data.activities : [];
  renderCustomStatus(activities);
  renderActivity(activities);
  renderDevices(data);
  renderSpotify(data);

  setInfoText("accountUsername", username || "Non disponible");
  setInfoText("accountId", user.id || USER_ID);
  $("apiNote").textContent = "Profil chargé en direct depuis l'API Tanox.";
}

async function loadDiscordProfile() {
  try {
    const res = await fetch(`${CONFIG.api}?_t=${Date.now()}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    applyProfile(await res.json());
    profileLoaded = true;
  } catch (err) {
    console.warn("Profil Discord indisponible :", err);
    if (!profileLoaded) {
      $("discordStatus").textContent = "Profil indisponible";
      $("statusDot").className = "status-dot";
      $("apiNote").textContent = "L'API n'a pas répondu. Nouvelle tentative automatique.";
    }
  }
}

let timer = null;
function startPolling() { stopPolling(); timer = setInterval(loadDiscordProfile, CONFIG.refreshMs); }
function stopPolling() { clearInterval(timer); timer = null; }
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPolling();
  else { loadDiscordProfile(); startPolling(); }
});

/* ---------- Démarrage ---------- */
$("year").textContent = new Date().getFullYear();
navigate(location.hash.slice(1), false);
loadDiscordProfile();
startPolling();
const hideLoader = () => $("loader").classList.add("hidden");
window.addEventListener("load", () => setTimeout(hideLoader, 450));
setTimeout(hideLoader, 1800);
